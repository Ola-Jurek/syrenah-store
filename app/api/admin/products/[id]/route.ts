export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/products/[id]
 * Zwraca produkt z images, category i discounts
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        discounts: {
          select: {
            id: true,
            code: true,
            namePl: true,
            type: true,
            value: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const formattedProduct = {
      id: product.id,
      namePl: product.namePl,
      nameEn: product.nameEn,
      descriptionPl: product.descriptionPl || null,
      descriptionEn: product.descriptionEn || null,
      pricePln: Number(product.pricePln),
      priceEur: Number(product.priceEur),
      salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
      salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
      stock: product.stock,
      sku: product.sku || null,
      slug: product.slug,
      categoryId: product.categoryId,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        altPl: img.altPl || null,
        altEn: img.altEn || null,
        isPrimary: img.isPrimary,
      })),
      discounts: product.discounts.map((d) => ({
        id: d.id,
        code: d.code,
        namePl: d.namePl,
        type: d.type,
        value: Number(d.value),
        isActive: d.isActive,
      })),
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN PRODUCT GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Aktualizuje produkt, obrazy i przypisanie rabatu
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
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
      colors,
      images,
      discountId,
    } = body;

    // Sprawdź czy produkt istnieje
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { discounts: { select: { id: true } } },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Przygotuj dane do aktualizacji produktu
    const productData: any = {};
    if (namePl !== undefined) productData.namePl = namePl;
    if (nameEn !== undefined) productData.nameEn = nameEn;
    if (descriptionPl !== undefined) productData.descriptionPl = descriptionPl || null;
    if (descriptionEn !== undefined) productData.descriptionEn = descriptionEn || null;
    if (pricePln !== undefined) productData.pricePln = new Prisma.Decimal(pricePln);
    if (priceEur !== undefined) productData.priceEur = new Prisma.Decimal(priceEur);
    if (salePricePln !== undefined) {
      productData.salePricePln = salePricePln ? new Prisma.Decimal(salePricePln) : null;
    }
    if (salePriceEur !== undefined) {
      productData.salePriceEur = salePriceEur ? new Prisma.Decimal(salePriceEur) : null;
    }
    if (stock !== undefined) productData.stock = parseInt(stock);
    if (sku !== undefined) productData.sku = sku || null;
    if (slug !== undefined) productData.slug = slug;
    if (categoryId !== undefined) {
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
      productData.categoryId = categoryId;
    }
    if (sizes !== undefined) productData.sizes = sizes && Array.isArray(sizes) && sizes.length > 0 ? sizes : null;
    if (colors !== undefined) productData.colors = colors && Array.isArray(colors) && colors.length > 0 ? colors : null;

    // Obsługa przypisania rabatu
    if (discountId !== undefined) {
      // Rozłącz wszystkie istniejące rabaty
      const currentDiscountIds = existingProduct.discounts.map((d) => d.id);
      if (currentDiscountIds.length > 0) {
        productData.discounts = {
          disconnect: currentDiscountIds.map((dId) => ({ id: dId })),
        };
      }

      // Jeśli nowy discountId jest podany, dołącz
      if (discountId) {
        productData.discounts = {
          ...(productData.discounts || {}),
          connect: [{ id: discountId }],
        };
      }
    }

    // Aktualizuj produkt i obrazy w transakcji
    await prisma.$transaction(async (tx) => {
      // Aktualizuj produkt
      if (Object.keys(productData).length > 0) {
        await tx.product.update({
          where: { id },
          data: productData,
        });
      }

      // Obsługa obrazów
      if (images && Array.isArray(images)) {
        // Znajdź obrazy do usunięcia
        const toDelete = images.filter((img: any) => img._delete === true && img.id);
        if (toDelete.length > 0) {
          await tx.image.deleteMany({
            where: {
              id: { in: toDelete.map((img: any) => img.id) },
              productId: id,
            },
          });
        }

        // Znajdź obrazy do aktualizacji
        const toUpdate = images.filter(
          (img: any) => img.id && !img._delete
        );
        for (const img of toUpdate) {
          await tx.image.update({
            where: { id: img.id },
            data: {
              url: img.url,
              altPl: img.altPl || null,
              altEn: img.altEn || null,
              isPrimary: img.isPrimary === true,
            },
          });
        }

        // Znajdź obrazy do utworzenia
        const toCreate = images.filter((img: any) => !img.id && !img._delete);
        if (toCreate.length > 0) {
          await tx.image.createMany({
            data: toCreate.map((img: any) => ({
              url: img.url,
              altPl: img.altPl || null,
              altEn: img.altEn || null,
              isPrimary: img.isPrimary === true,
              productId: id,
            })),
          });
        }

        // Dopilnuj, żeby był max 1 primary
        const primaryImages = await tx.image.findMany({
          where: { productId: id, isPrimary: true },
          orderBy: { updatedAt: "desc" },
        });

        if (primaryImages.length > 1) {
          const others = primaryImages.slice(1);
          await tx.image.updateMany({
            where: {
              id: { in: others.map((img) => img.id) },
            },
            data: { isPrimary: false },
          });
        }

        if (primaryImages.length === 0) {
          const firstImage = await tx.image.findFirst({
            where: { productId: id },
            orderBy: { createdAt: "asc" },
          });
          if (firstImage) {
            await tx.image.update({
              where: { id: firstImage.id },
              data: { isPrimary: true },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

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

    console.error("ADMIN PRODUCT UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Usuwa produkt (obrazy usuną się kaskadowo)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Usuń produkt (obrazy usuną się kaskadowo przez onDelete: Cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.error("ADMIN PRODUCT DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
