export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { resend } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/emails/orderConfirmation";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();

    if (!bodyText) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const { sessionId } = JSON.parse(bodyText);

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const total = session.amount_total! / 100;

    
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        alreadyProcessed: true,
      });
    }


    // Odczytaj dane dostawy z metadanych Stripe
    const shippingRaw = session.metadata?.shipping;
    const invoiceRaw = session.metadata?.invoice;
    const alternateShippingRaw = session.metadata?.alternateShipping;
    const userId = session.metadata?.userId || null;
    const discountId = session.metadata?.discountId || null;

    let shippingData: any = null;
    let invoiceData: any = null;
    let alternateShippingData: any = null;

    if (shippingRaw) {
      try { shippingData = JSON.parse(shippingRaw); } catch { /* ignore */ }
    }
    if (invoiceRaw) {
      try { invoiceData = JSON.parse(invoiceRaw); } catch { /* ignore */ }
    }
    if (alternateShippingRaw) {
      try { alternateShippingData = JSON.parse(alternateShippingRaw); } catch { /* ignore */ }
    }

    const order = await prisma.order.create({
      data: {
        stripeSessionId: sessionId,
        status: OrderStatus.PROCESSING,
        totalPln: new Prisma.Decimal(total),
        totalEur: new Prisma.Decimal(total),
        ...(userId ? { userId } : {}),
        ...(discountId ? { discountId } : {}),

        // Dane dostawy
        shippingEmail: shippingData?.email || session.customer_details?.email || null,
        shippingName: shippingData?.fullName || session.customer_details?.name || null,
        shippingPhone: shippingData?.phone || null,
        shippingMethod: shippingData?.shippingMethod || null,
        shippingCost: shippingData?.shippingCost ? new Prisma.Decimal(shippingData.shippingCost) : null,
        shippingAddress: shippingData?.shippingAddress || null,

        // Faktura VAT
        isInvoiceRequested: !!invoiceData,
        companyName: invoiceData?.companyName || null,
        vatNumber: invoiceData?.vatNumber || null,
        billingAddress: invoiceData ? {
          street: invoiceData.street,
          postalCode: invoiceData.postalCode,
          city: invoiceData.city,
        } : null,

        // Inny adres dostawy
        isDifferentShippingAddress: !!alternateShippingData,
        alternateShippingAddress: alternateShippingData || null,
      },
    });

    const cartRaw = session.metadata?.cart;

    if (!cartRaw) {
      throw new Error("Missing cart in Stripe session metadata");
    }

    const cart = JSON.parse(cartRaw) as Array<{
      productId: string;
      quantity: number;
      price: number;
      name: string;
    }>;

    for (const item of cart) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          pricePln: new Prisma.Decimal(item.price),
          priceEur: new Prisma.Decimal(item.price),
        },
      });
    };

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;
    await resend.emails.send({
      from: "Syrenah Store <onboarding@resend.dev>",
      to: session.customer_details?.email ?? "test@example.com",
      subject: `Potwierdzenie zamówienia #${order.id}`,
      html: orderConfirmationEmail({
        orderId: order.id,
        total,
        trackingUrl,
      }),
    });
        

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("ORDER SAVE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    );
  }
}

