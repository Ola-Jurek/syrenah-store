export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";
import { parseSizeChart } from "@/lib/size-chart";
import {
  parseSizeLabels,
  sellableStock,
  syncProductSizeStocks,
} from "@/lib/size-stock";

/**
 * GET /api/admin/products
 * Zwraca listę produktów (max 50) z category i primary image
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const now = new Date();

    const products = await prisma.product.findMany({
      take: 500,
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
        sizeStocks: {
          select: { size: true, stock: true },
        },
        discounts: {
          where: {
            isActive: true,
            validFrom: { lte: now },
            OR: [
              { validUntil: null },
              { validUntil: { gte: now } },
            ],
          },
          take: 1,
          select: {
            id: true,
            code: true,
            namePl: true,
            type: true,
            value: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => {
      const activeDiscount = product.discounts[0] || null;
      return {
        id: product.id,
        namePl: product.namePl,
        nameEn: product.nameEn,
        pricePln: Number(product.pricePln),
        priceEur: Number(product.priceEur),
        salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
        salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
        stock: sellableStock(product.stock, product.sizes, product.sizeStocks),
        sku: product.sku || null,
        slug: product.slug,
        category: product.category,
        primaryImage: product.images[0] || null,
        activeDiscount: activeDiscount
          ? {
              id: activeDiscount.id,
              code: activeDiscount.code,
              namePl: activeDiscount.namePl,
              type: activeDiscount.type,
              value: Number(activeDiscount.value),
            }
          : null,
      };
    });

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
 * Tworzy nowy produkt z opcjonalnymi obrazami i rabatem
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
      salePricePln,
      salePriceEur,
      stock,
      sku,
      slug,
      categoryId,
      sizes,
      sizeStocks,
      colors,
      sizeChart,
      images,
      discountId,
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

    const chart = parseSizeChart(sizeChart);
    const sizeLabels = parseSizeLabels(sizes);

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
          salePricePln: salePricePln ? new Prisma.Decimal(salePricePln) : null,
          salePriceEur: salePriceEur ? new Prisma.Decimal(salePriceEur) : null,
          stock: sizeLabels.length > 0 ? 0 : parseInt(stock),
          sku: sku || null,
          slug,
          categoryId,
          sizes: sizeLabels.length > 0 ? sizeLabels : Prisma.DbNull,
          colors: colors && Array.isArray(colors) && colors.length > 0 ? colors : Prisma.DbNull,
          sizeChart: chart ?? Prisma.DbNull,
          // Przypisz rabat, jeśli został wybrany
          ...(discountId ? {
            discounts: {
              connect: [{ id: discountId }],
            },
          } : {}),
        },
      });

      const sizeTotal = await syncProductSizeStocks(
        tx,
        newProduct.id,
        sizeLabels,
        sizeStocks
      );
      if (sizeTotal !== null) {
        await tx.product.update({
          where: { id: newProduct.id },
          data: { stock: sizeTotal },
        });
      }

      // Jeśli są obrazy, utwórz je
      if (images && Array.isArray(images) && images.length > 0) {
        let hasPrimary = false;
        const imageData = images
          .filter((img: any) => typeof img.url === "string" && img.url.trim() !== "")
          .map((img: any, index: number) => {
            const isPrimary = img.isPrimary === true || (!hasPrimary && index === 0);
            if (isPrimary) hasPrimary = true;
            return {
              url: img.url.trim(),
              altPl: img.altPl || null,
              altEn: img.altEn || null,
              isPrimary,
              productId: newProduct.id,
            };
          });

        if (imageData.length > 0) {
          await tx.image.createMany({
            data: imageData,
          });
        }
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
