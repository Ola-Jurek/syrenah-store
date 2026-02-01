export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/images?ids=id1,id2,id3
 * Zwraca mapowanie productId -> imageUrl dla podanych ID produktów
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json([]);
    }

    const productIds = idsParam.split(",").filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const images = products.map((product) => ({
      productId: product.id,
      imageUrl: product.images[0]?.url || null,
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("PRODUCT IMAGES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch product images" },
      { status: 500 }
    );
  }
}

