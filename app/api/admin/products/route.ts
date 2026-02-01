export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/products
 * Zwraca listę produktów (max 50) z category i primary image
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const products = await prisma.product.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            namePl: true,
            nameEn: true,
            slug: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      namePl: product.namePl,
      nameEn: product.nameEn,
      pricePln: Number(product.pricePln),
      priceEur: Number(product.priceEur),
      stock: product.stock,
      sku: product.sku || null,
      slug: product.slug,
      category: product.category,
      primaryImage: product.images[0] || null,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN PRODUCTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Tworzy nowy produkt z opcjonalnymi obrazami
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const {
      namePl,
      nameEn,
      descriptionPl,
      descriptionEn,
      pricePln,
      priceEur,
      stock,
      sku,
      slug,
      categoryId,
      sizes,
      colors,
      images,
    } = body;

    // Walidacja wymaganych pól
    if (!namePl || !pricePln || stock === undefined || !slug || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: namePl, pricePln, stock, slug, categoryId" },
        { status: 400 }
      );
    }

    // Sprawdź czy kategoria istnieje
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Utwórz produkt z obrazami w transakcji
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          namePl,
          nameEn: nameEn || "",
          descriptionPl: descriptionPl || null,
          descriptionEn: descriptionEn || null,
          pricePln: new Prisma.Decimal(pricePln),
          priceEur: new Prisma.Decimal(priceEur || pricePln),
          stock: parseInt(stock),
          sku: sku || null,
          slug,
          categoryId,
          sizes: sizes && Array.isArray(sizes) && sizes.length > 0 ? sizes : null,
          colors: colors && Array.isArray(colors) && colors.length > 0 ? colors : null,
        },
      });

      // Jeśli są obrazy, utwórz je
      if (images && Array.isArray(images) && images.length > 0) {
        let hasPrimary = false;
        const imageData = images.map((img: any, index: number) => {
          const isPrimary = img.isPrimary === true || (!hasPrimary && index === 0);
          if (isPrimary) hasPrimary = true;
          return {
            url: img.url,
            altPl: img.altPl || null,
            altEn: img.altEn || null,
            isPrimary,
            productId: newProduct.id,
          };
        });

        await tx.image.createMany({
          data: imageData,
        });
      }

      return newProduct;
    });

    return NextResponse.json({ product: { id: product.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    // Prisma unique constraint error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Product with this slug or SKU already exists" },
        { status: 400 }
      );
    }

    console.error("ADMIN PRODUCT CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

