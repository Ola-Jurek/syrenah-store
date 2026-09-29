export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/categories/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
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

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        id: category.id,
        namePl: category.namePl,
        nameEn: category.nameEn,
        descriptionPl: category.descriptionPl,
        descriptionEn: category.descriptionEn,
        slug: category.slug,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN CATEGORY GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories/[id]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
    const body = await req.json();
    const { namePl, nameEn, descriptionPl, descriptionEn, slug } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const data: {
      namePl?: string;
      nameEn?: string;
      descriptionPl?: string | null;
      descriptionEn?: string | null;
      slug?: string;
    } = {};

    if (namePl !== undefined) {
      if (!String(namePl).trim()) {
        return NextResponse.json(
          { error: "Nazwa PL nie może być pusta" },
          { status: 400 }
        );
      }
      data.namePl = String(namePl).trim();
    }

    if (nameEn !== undefined) {
      data.nameEn = String(nameEn).trim() || data.namePl || existing.namePl;
    }

    if (descriptionPl !== undefined) {
      data.descriptionPl = descriptionPl?.trim() || null;
    }

    if (descriptionEn !== undefined) {
      data.descriptionEn = descriptionEn?.trim() || null;
    }

    if (slug !== undefined) {
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
      data.slug = normalizedSlug;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        namePl: true,
        nameEn: true,
        descriptionPl: true,
        descriptionEn: true,
        slug: true,
      },
    });

    return NextResponse.json({ category });
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

    console.error("ADMIN CATEGORY PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Nie pozwala usunąć kategorii z produktami
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: `Nie można usunąć — kategoria ma ${category._count.products} produkt(ów). Przenieś je najpierw.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN CATEGORY DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
