export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

/**
 * POST /api/admin/discounts/apply-category
 *
 * Body: { discountId: string, categoryId: string }
 *
 * Przypisuje rabat do WSZYSTKICH produktów w danej kategorii.
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { discountId, categoryId } = body;

    if (!discountId || !categoryId) {
      return NextResponse.json(
        { error: "discountId i categoryId są wymagane" },
        { status: 400 }
      );
    }

    // Sprawdź czy rabat istnieje
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    if (!discount) {
      return NextResponse.json(
        { error: "Rabat nie znaleziony" },
        { status: 404 }
      );
    }

    // Sprawdź czy kategoria istnieje
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, namePl: true },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategoria nie znaleziona" },
        { status: 404 }
      );
    }

    // Pobierz wszystkie produkty z tej kategorii
    const products = await prisma.product.findMany({
      where: { categoryId },
      select: { id: true },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Brak produktów w tej kategorii" },
        { status: 400 }
      );
    }

    // Przypisz rabat do wszystkich produktów w kategorii
    // Używamy disconnect + connect aby nie dublować relacji
    await prisma.discount.update({
      where: { id: discountId },
      data: {
        products: {
          connect: products.map((p) => ({ id: p.id })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rabat "${discount.code}" przypisany do ${products.length} produktów w kategorii "${category.namePl}"`,
      productsCount: products.length,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN APPLY CATEGORY DISCOUNT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to apply discount to category" },
      { status: 500 }
    );
  }
}
