export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shipping, discountCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Sprawdź sesję użytkownika
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // KRYTYCZNE: Pobierz ceny z bazy danych 
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        discounts: {
          where: {
            isActive: true,
            validFrom: { lte: new Date() },
            OR: [
              { validUntil: null },
              { validUntil: { gte: new Date() } },
            ],
          },
          take: 1,
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // ──── Walidacja kodu rabatowego z koszyka ────
    let cartDiscount: {
      id: string;
      code: string;
      type: "PERCENTAGE" | "FIXED";
      value: number;
    } | null = null;

    if (discountCode && typeof discountCode === "string") {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.trim().toUpperCase() },
      });

      if (
        discount &&
        discount.isActive &&
        discount.validFrom <= new Date() &&
        (!discount.validUntil || discount.validUntil >= new Date())
      ) {
        cartDiscount = {
          id: discount.id,
          code: discount.code,
          type: discount.type as "PERCENTAGE" | "FIXED",
          value: Number(discount.value),
        };
      }
      // Jeśli kod jest nieprawidłowy — po prostu ignorujemy (nie blokujemy checkout)
    }

    // Buduj line items na podstawie cen z bazy
    const verifiedItems: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    const lineItems: any[] = [];
    let totalRegularPrice = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const discountInfo = extractDiscountInfo(product.discounts);
      const pricing = getEffectivePrice({
        pricePln: Number(product.pricePln),
        priceEur: Number(product.priceEur),
        salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
        salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
        discount: discountInfo,
      });

      // Cena z product-level discount/salePrice
      const productLevelPrice = pricing.finalPricePln;

      // Regularna cena (do obliczenia zniżki z kodu koszyka)
      const regularPrice = Number(product.pricePln);
      totalRegularPrice += regularPrice * item.quantity;

      // Jeśli jest kod rabatowy z koszyka — oblicz cenę od regularnej
      let cartCodePrice = regularPrice;
      if (cartDiscount) {
        if (cartDiscount.type === "PERCENTAGE") {
          cartCodePrice = Math.round(regularPrice * (1 - cartDiscount.value / 100) * 100) / 100;
        } else {
          // FIXED — rozłóż kwotę stałą proporcjonalnie na produkty
          // Dla prostoty: kwota stała odejmowana od sumy (obsłużone niżej)
          cartCodePrice = regularPrice; // placeholder, obsłużone globalnie
        }
      }

      // Klient dostaje LEPSZĄ cenę z dwóch opcji
      let finalPrice: number;
      if (cartDiscount && cartDiscount.type === "PERCENTAGE") {
        finalPrice = Math.min(productLevelPrice, cartCodePrice);
      } else {
        // Dla FIXED: zostawiamy product-level, rabat dodamy jako osobną pozycję
        finalPrice = productLevelPrice;
      }

      verifiedItems.push({
        productId: product.id,
        name: product.namePl,
        price: finalPrice,
        quantity: item.quantity,
      });

      lineItems.push({
        price_data: {
          currency: "pln",
          product_data: {
            name: product.namePl,
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: item.quantity,
      });
    }

    // Dla rabatu FIXED z koszyka — dodaj jako ujemną pozycję (coupon-style)
    if (cartDiscount && cartDiscount.type === "FIXED") {
      const subtotalFromItems = verifiedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const fixedDiscountAmount = Math.min(cartDiscount.value, subtotalFromItems);

      if (fixedDiscountAmount > 0) {
        // Stripe nie pozwala na ujemne kwoty w line_items,
        // więc użyjemy Stripe Coupon / discount
        // Alternatywa: przeliczymy ceny produktów proporcjonalnie
        
        // Podejście: proporcjonalnie rozłóż zniżkę na produkty
        const ratio = (subtotalFromItems - fixedDiscountAmount) / subtotalFromItems;
        
        // Wyczyść line items i przelicz
        lineItems.length = 0;
        for (const vi of verifiedItems) {
          const adjustedPrice = Math.round(vi.price * ratio * 100) / 100;
          lineItems.push({
            price_data: {
              currency: "pln",
              product_data: {
                name: vi.name,
              },
              unit_amount: Math.max(1, Math.round(adjustedPrice * 100)), // min 1 grosz
            },
            quantity: vi.quantity,
          });
        }
      }
    }

    const metadata: Record<string, string> = {
      cart: JSON.stringify(verifiedItems),
    };

    // Jeśli użytkownik jest zalogowany, przekaż jego id w metadata
    if (userId) {
      metadata.userId = userId;
    }

    // Zapisz dane dostawy w metadata Stripe
    if (shipping) {
      // Stripe metadata ma limit 500 znaków na wartość — rozbij na mniejsze klucze
      const { invoice, alternateShipping, ...shippingCore } = shipping;
      metadata.shipping = JSON.stringify(shippingCore);

      if (invoice) {
        metadata.invoice = JSON.stringify(invoice);
      }

      if (alternateShipping) {
        metadata.alternateShipping = JSON.stringify(alternateShipping);
      }
    }

    // Zapisz kod rabatowy w metadata
    if (cartDiscount) {
      metadata.discountId = cartDiscount.id;
      metadata.discountCode = cartDiscount.code;
    }

    // Dodaj koszt dostawy jako osobną pozycję
    if (shipping?.shippingCost && shipping.shippingCost > 0) {
      let shippingLabel = "Kurier";
      if (shipping.shippingMethod === "parcel_locker") {
        const lockerCode = shipping.shippingAddress?.parcelLockerCode;
        shippingLabel = lockerCode
          ? `Paczkomat ${lockerCode}`
          : "Paczkomat";
      }

      lineItems.push({
        price_data: {
          currency: "pln",
          product_data: {
            name: `Dostawa — ${shippingLabel}`,
          },
          unit_amount: Math.round(shipping.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Przygotuj dane klienta dla Stripe (formularz → sesja zalogowanego → brak)
    const customerEmail = shipping?.email || session?.user?.email || undefined;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(customerEmail && { customer_email: customerEmail }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
