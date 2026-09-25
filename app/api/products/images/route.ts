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
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    const images = products.map((product) => {
      const primary =
        product.images.find((img) => img.isPrimary && img.url?.trim()) ||
        product.images.find((img) => img.url?.trim()) ||
        null;
      return {
        productId: product.id,
        imageUrl: primary?.url || null,
      };
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("PRODUCT IMAGES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch product images" },
      { status: 500 }
    );
  }
}

