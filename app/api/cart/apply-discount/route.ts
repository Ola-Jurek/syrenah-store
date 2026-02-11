export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cart/apply-discount
 *
 * Body: { code: string, items: Array<{ productId: string; quantity: number }> }
 *
 * Logika:
 * - Wyszukaj rabat po kodzie
 * - Sprawdź: isActive, validFrom ≤ now, validUntil ≥ now (lub null)
 * - Oblicz zniżkę od CENY REGULARNEJ (pricePln) — nie od salePrice ani product-level discount
 * - Zwróć info o rabacie i kwotę zniżki
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, items } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Kod rabatowy jest wymagany" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Koszyk jest pusty" },
        { status: 400 }
      );
    }

    // Znajdź rabat po kodzie
    const discount = await prisma.discount.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod rabatowy" },
        { status: 404 }
      );
    }

    // Sprawdź czy aktywny
    if (!discount.isActive) {
      return NextResponse.json(
        { error: "Ten kod rabatowy jest nieaktywny" },
        { status: 400 }
      );
    }

    // Sprawdź daty ważności
    const now = new Date();
    if (discount.validFrom > now) {
      return NextResponse.json(
        { error: "Ten kod rabatowy jeszcze nie obowiązuje" },
        { status: 400 }
      );
    }

    if (discount.validUntil && discount.validUntil < now) {
      return NextResponse.json(
        { error: "Ten kod rabatowy wygasł" },
        { status: 400 }
      );
    }

    // Pobierz produkty z koszyka
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        pricePln: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Oblicz zniżkę od ceny regularnej (pricePln)
    let totalRegularPrice = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      totalRegularPrice += Number(product.pricePln) * (item.quantity || 1);
    }

    let discountAmount = 0;
    const discountValue = Number(discount.value);

    if (discount.type === "PERCENTAGE") {
      discountAmount = Math.round(totalRegularPrice * (discountValue / 100) * 100) / 100;
    } else {
      // FIXED — kwota stała, max tyle co suma regularna
      discountAmount = Math.min(discountValue, totalRegularPrice);
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        namePl: discount.namePl,
        type: discount.type,
        value: discountValue,
      },
      totalRegularPrice: Math.round(totalRegularPrice * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAfterDiscount: Math.round((totalRegularPrice - discountAmount) * 100) / 100,
    });
  } catch (error) {
    console.error("APPLY DISCOUNT ERROR:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
