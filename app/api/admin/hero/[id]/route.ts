export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/hero/[id]
 * Aktualizuje ustawienia Hero
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
    const body = await req.json();
    const { title, subtitle, buttonText, link } = body;

    const heroSettings = await prisma.heroSettings.update({
      where: { id },
      data: {
        ...(title && { titlePl: title }),
        subtitlePl: subtitle !== undefined ? (subtitle || null) : undefined,
        ...(buttonText && { buttonTextPl: buttonText }),
        ...(link && { link }),
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(heroSettings);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    // Jeśli ustawienia nie istnieją, Prisma rzuci P2025
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Hero settings not found" },
        { status: 404 }
      );
    }

    console.error("ADMIN HERO PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update hero settings" },
      { status: 500 }
    );
  }
}

