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
        slug: true,
      },
    });

    return NextResponse.json({ categories });
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

