export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wishlist
 * Zwraca listę produktów z wishlisty zalogowanego użytkownika
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                category: {
                  select: {
                    slug: true,
                    namePl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({ items: [], productIds: [] });
    }

    const items = wishlist.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        namePl: item.product.namePl,
        nameEn: item.product.nameEn,
        slug: item.product.slug,
        pricePln: item.product.pricePln.toString(),
        priceEur: item.product.priceEur.toString(),
        image: item.product.images[0]?.url ?? null,
        imageAlt: item.product.images[0]?.altPl ?? item.product.namePl,
        categorySlug: item.product.category.slug,
        categoryName: item.product.category.namePl,
      },
      createdAt: item.createdAt.toISOString(),
    }));

    const productIds = wishlist.items.map((item) => item.productId);

    return NextResponse.json({ items, productIds });
  } catch (error) {
    console.error("WISHLIST GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Dodaje lub usuwa produkt z wishlisty (toggle)
 * Body: { productId: string }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    // Sprawdź czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Znajdź lub utwórz wishlistę
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    // Sprawdź czy produkt jest już w wishliście
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Usuń z wishlisty (toggle off)
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });

      return NextResponse.json({
        action: "removed",
        productId,
      });
    } else {
      // Dodaj do wishlisty (toggle on)
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });

      return NextResponse.json({
        action: "added",
        productId,
      });
    }
  } catch (error) {
    console.error("WISHLIST POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
