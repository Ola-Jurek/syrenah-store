export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/categories
 * Zwraca listę kategorii posortowanych po namePl asc
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const categories = await prisma.category.findMany({
      orderBy: { namePl: "asc" },
      select: {
        id: true,
        namePl: true,
        nameEn: true,
        descriptionPl: true,
        descriptionEn: true,
        slug: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        namePl: c.namePl,
        nameEn: c.nameEn,
        descriptionPl: c.descriptionPl,
        descriptionEn: c.descriptionEn,
        slug: c.slug,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN CATEGORIES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Tworzy nową kategorię
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { namePl, nameEn, descriptionPl, descriptionEn, slug } = body;

    if (!namePl?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "Wymagane pola: namePl, slug" },
        { status: 400 }
      );
    }

    const normalizedSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!normalizedSlug) {
      return NextResponse.json(
        { error: "Nieprawidłowy slug" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        namePl: namePl.trim(),
        nameEn: (nameEn || namePl).trim(),
        descriptionPl: descriptionPl?.trim() || null,
        descriptionEn: descriptionEn?.trim() || null,
        slug: normalizedSlug,
      },
      select: {
        id: true,
        namePl: true,
        nameEn: true,
        descriptionPl: true,
        descriptionEn: true,
        slug: true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 400 }
      );
    }

    console.error("ADMIN CATEGORY CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

