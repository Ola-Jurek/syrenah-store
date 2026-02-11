export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/discounts/:id
 * Pobiera pojedynczy rabat
 */
export async function GET(req: Request, ctx: Ctx) {
  try {
    assertAdmin(req);
    const { id } = await ctx.params;

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, namePl: true, slug: true },
        },
      },
    });

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    return NextResponse.json({
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
        products: discount.products,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN GET DISCOUNT ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/discounts/:id
 * Aktualizuje rabat
 */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    assertAdmin(req);
    const { id } = await ctx.params;

    const body = await req.json();
    const { code, namePl, nameEn, type, value, validFrom, validUntil, isActive } = body;

    // Sprawdź czy rabat istnieje
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    // Jeśli zmienia się kod — sprawdź unikalność
    if (code && code !== existing.code) {
      const duplicate = await prisma.discount.findUnique({
        where: { code: code.trim().toUpperCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Rabat o takim kodzie już istnieje" },
          { status: 409 }
        );
      }
    }

    if (type && !["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json(
        { error: "Typ rabatu musi być PERCENTAGE lub FIXED" },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(namePl !== undefined && { namePl: namePl?.trim() || null }),
        ...(nameEn !== undefined && { nameEn: nameEn?.trim() || null }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: Number(value) }),
        ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
        ...(validUntil !== undefined && {
          validUntil: validUntil ? new Date(validUntil) : null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN PATCH DISCOUNT ERROR:", error);
    return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/discounts/:id
 * Usuwa rabat
 */
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    assertAdmin(req);
    const { id } = await ctx.params;

    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    await prisma.discount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN DELETE DISCOUNT ERROR:", error);
    return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
  }
}
