import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/categories
 * Public endpoint - returns list of categories
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { namePl: "asc" },
      select: {
        id: true,
        namePl: true,
        nameEn: true,
        slug: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("CATEGORIES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
