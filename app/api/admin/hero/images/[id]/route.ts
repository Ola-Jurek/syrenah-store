export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/hero/images/[id]
 * Usuwa zdjęcie z Hero
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    await prisma.heroImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    // Jeśli zdjęcie nie istnieje, Prisma rzuci P2025
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Hero image not found" },
        { status: 404 }
      );
    }

    console.error("ADMIN HERO IMAGE DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete hero image" },
      { status: 500 }
    );
  }
}

