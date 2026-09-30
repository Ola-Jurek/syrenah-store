export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { resend, storeFromEmail } from "@/lib/email";
import {
  orderConfirmationEmail,
  orderConfirmationSubject,
} from "@/lib/emails/orderConfirmation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type ShippingMeta = {
  email?: string;
  fullName?: string;
  phone?: string;
  shippingMethod?: string;
  shippingCost?: number;
  shippingAddress?: Prisma.InputJsonValue;
};

type InvoiceMeta = {
  companyName?: string;
  vatNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
};

function parseMetaJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function orderShippingFromSession(session: Stripe.Checkout.Session) {
  const shippingData = parseMetaJson<ShippingMeta>(session.metadata?.shipping);
  const invoiceData = parseMetaJson<InvoiceMeta>(session.metadata?.invoice);
  const alternateShippingData = parseMetaJson<Prisma.InputJsonValue>(
    session.metadata?.alternateShipping
  );
  const discountId = session.metadata?.discountId || null;

  return {
    shippingEmail:
      shippingData?.email || session.customer_details?.email || null,
    shippingName:
      shippingData?.fullName || session.customer_details?.name || null,
    shippingPhone: shippingData?.phone || null,
    shippingMethod: shippingData?.shippingMethod || null,
    shippingCost:
      shippingData?.shippingCost != null
        ? new Prisma.Decimal(shippingData.shippingCost)
        : null,
    shippingAddress: shippingData?.shippingAddress ?? Prisma.DbNull,
    isInvoiceRequested: !!invoiceData,
    companyName: invoiceData?.companyName || null,
    vatNumber: invoiceData?.vatNumber || null,
    billingAddress: invoiceData
      ? {
          street: invoiceData.street,
          postalCode: invoiceData.postalCode,
          city: invoiceData.city,
        }
      : Prisma.DbNull,
    isDifferentShippingAddress: !!alternateShippingData,
    alternateShippingAddress: alternateShippingData ?? Prisma.DbNull,
    ...(discountId ? { discountId } : {}),
  };
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("WEBHOOK SIGNATURE ERROR:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    console.log("Webhook start...");
    console.log("Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      console.log("Session ID:", sessionId);

      // Idempotencja: sprawdź czy zamówienie już istnieje
      console.log("Checking for existing order...");
      const existing = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
      });

      if (existing) {
        console.log("Found order in DB: TAK");
        console.log("Existing order ID:", existing.id);
        console.log("Existing order status:", existing.status);

        const shippingFields = orderShippingFromSession(session);
        const needsShippingBackfill = !existing.shippingName && !existing.shippingEmail;

        // Jeśli już jest PAID — ewentualnie tylko uzupełnij brakujące dane dostawy
        if (existing.status === OrderStatus.PAID) {
          if (needsShippingBackfill) {
            await prisma.order.update({
              where: { id: existing.id },
              data: shippingFields,
            });
            console.log(`Order ${existing.id} shipping backfilled`);
          }
          console.log(`Order ${existing.id} already has status PAID`);
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        // Jeśli istnieje z innym statusem (np. PROCESSING), zaktualizuj na PAID + uzupełnij shipping
        console.log("Trying to update status to PAID...");
        const updated = await prisma.order.update({
          where: { id: existing.id },
          data: {
            status: OrderStatus.PAID,
            ...(needsShippingBackfill ? shippingFields : {}),
          },
        });
        console.log(`Order ${updated.id} status updated to PAID`);
        console.log("Updated order status:", updated.status);
        return NextResponse.json({ received: true, updated: true });
      }

      console.log("Found order in DB: NIE - creating new order");

      const total = (session.amount_total ?? 0) / 100;
      console.log("Total amount:", total);

      const checkoutLocale =
        session.metadata?.checkoutLocale === "en" ? "en" : "pl";
      const totalEurFromMeta = session.metadata?.totalEur
        ? parseFloat(session.metadata.totalEur)
        : total;

      // Cart trzymamy w metadata
      const cartRaw = session.metadata?.cart;
      if (!cartRaw) {
        console.warn("Missing cart metadata on session:", sessionId);
        return NextResponse.json(
          { error: "Missing cart metadata" },
          { status: 400 }
        );
      }

      const cart = JSON.parse(cartRaw) as Array<{
        productId: string;
        quantity: number;
        price: number;
        priceEur?: number;
        name: string;
        nameEn?: string;
        size?: string;
      }>;
      console.log("Cart items count:", cart.length);

      // Odczytaj userId z metadata (jeśli użytkownik był zalogowany przy checkout)
      const userId = session.metadata?.userId || null;
      console.log("User ID from metadata:", userId);

      const shippingFields = orderShippingFromSession(session);

      // Wszystko w transakcji dla atomowości
      const order = await prisma.$transaction(async (tx) => {
        // Utwórz zamówienie z statusem PAID + danymi dostawy
        console.log("Creating order with status PAID");
        const newOrder = await tx.order.create({
          data: {
            stripeSessionId: sessionId,
            status: OrderStatus.PAID,
            totalPln: new Prisma.Decimal(total),
            totalEur: new Prisma.Decimal(totalEurFromMeta),
            language: checkoutLocale,
            ...(userId ? { userId } : {}),
            ...shippingFields,
          },
        });

        // Utwórz OrderItems i zaktualizuj stock
        for (const item of cart) {
          // Utwórz OrderItem
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity ?? 1,
              size: item.size || null,
              pricePln: new Prisma.Decimal(item.price),
              priceEur: new Prisma.Decimal(
                item.priceEur != null ? item.priceEur : item.price
              ),
            },
          });

          const qty = item.quantity ?? 1;
          if (item.size) {
            const sizeRow = await tx.productSizeStock.findUnique({
              where: {
                productId_size: {
                  productId: item.productId,
                  size: item.size,
                },
              },
            });
            const decrement = Math.min(qty, sizeRow?.stock ?? 0);
            if (sizeRow && decrement > 0) {
              await tx.productSizeStock.update({
                where: { id: sizeRow.id },
                data: { stock: { decrement } },
              });
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement } },
              });
            }
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: qty },
              },
            });
          }
        }

        return newOrder;
      });

      console.log(`Order ${order.id} status updated to PAID`);

      // Wysyłka emaila potwierdzającego
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        console.log("--- RESEND DEBUG ---");
        console.log("Preparing to send email to:", customerEmail);
        console.log("Order ID:", order.id);
        console.log("Tracking URL:", `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`);

        try {
          const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;
          const emailResult = await resend.emails.send({
            from: storeFromEmail,
            to: customerEmail,
            subject: orderConfirmationSubject(order.id, checkoutLocale),
            html: orderConfirmationEmail({
              orderId: order.id,
              totalPln: Number(order.totalPln),
              totalEur: Number(order.totalEur),
              trackingUrl,
              locale: checkoutLocale,
            }),
          });

          console.log("--- RESEND DEBUG ---");
          console.log("Email sent successfully:", emailResult);
        } catch (emailError) {
          console.error("--- RESEND DEBUG ---");
          console.error("Failed to send email:", emailError);
          // Nie przerywamy procesu - zamówienie już jest zapisane
        }
      } else {
        console.log("--- RESEND DEBUG ---");
        console.log("No customer email found in session, skipping email");
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Znajdź zamówienie i ustaw status FAILED
      await prisma.order.updateMany({
        where: { stripeSessionId: sessionId },
        data: { status: OrderStatus.FAILED },
      });
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Znajdź zamówienie i ustaw status CANCELLED
      await prisma.order.updateMany({
        where: { stripeSessionId: sessionId },
        data: { status: OrderStatus.CANCELLED },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WEBHOOK HANDLER ERROR:", err);
    // Stripe będzie retryował webhook, więc zwróć 500 jeśli zapis nie wyszedł
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
