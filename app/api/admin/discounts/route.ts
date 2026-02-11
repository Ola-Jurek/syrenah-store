export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/discounts
 * Zwraca listę rabatów (aktywnych i nieaktywnych)
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        namePl: true,
        nameEn: true,
        type: true,
        value: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = discounts.map((d) => ({
      id: d.id,
      code: d.code,
      namePl: d.namePl,
      nameEn: d.nameEn,
      type: d.type,
      value: Number(d.value),
      validFrom: d.validFrom.toISOString(),
      validUntil: d.validUntil?.toISOString() ?? null,
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      productsCount: d._count.products,
    }));

    return NextResponse.json({ discounts: formatted });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN DISCOUNTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/discounts
 * Tworzy nowy rabat
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { code, namePl, nameEn, type, value, validFrom, validUntil, isActive } = body;

    // Walidacja
    if (!code || !type || value === undefined || value === null || !validFrom) {
      return NextResponse.json(
        { error: "Pola code, type, value i validFrom są wymagane" },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json(
        { error: "Typ rabatu musi być PERCENTAGE lub FIXED" },
        { status: 400 }
      );
    }

    if (Number(value) <= 0) {
      return NextResponse.json(
        { error: "Wartość rabatu musi być większa od 0" },
        { status: 400 }
      );
    }

    // Sprawdź unikalność kodu
    const existing = await prisma.discount.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Rabat o takim kodzie już istnieje" },
        { status: 409 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.trim().toUpperCase(),
        namePl: namePl?.trim() || null,
        nameEn: nameEn?.trim() || null,
        type,
        value: Number(value),
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      {
        discount: {
          id: discount.id,
          code: discount.code,
          namePl: discount.namePl,
          nameEn: discount.nameEn,
          type: discount.type,
          value: Number(discount.value),
          validFrom: discount.validFrom.toISOString(),
          validUntil: discount.validUntil?.toISOString() ?? null,
          isActive: discount.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN CREATE DISCOUNT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}
