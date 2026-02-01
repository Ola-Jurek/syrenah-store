export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/search?q=query
 * Wyszukuje produkty po nazwie i opisie (case-insensitive)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const searchTerm = query.trim();

    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            namePl: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            nameEn: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            descriptionPl: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            descriptionEn: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
        ],
      },
      take: 20,
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
      orderBy: { createdAt: "desc" },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      namePl: product.namePl,
      nameEn: product.nameEn,
      slug: product.slug,
      pricePln: Number(product.pricePln),
      priceEur: Number(product.priceEur),
      category: product.category,
      primaryImage: product.images[0] || null,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

