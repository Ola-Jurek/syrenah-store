export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/hero
 * Pobiera aktualne ustawienia Hero z obrazami
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const heroSettings = await prisma.heroSettings.findFirst({
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(heroSettings);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("ADMIN HERO GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero
 * Tworzy nowe ustawienia Hero
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { title, subtitle, buttonText, link } = body;

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const heroSettings = await prisma.heroSettings.create({
      data: {
        titlePl: title,
        subtitlePl: subtitle || null,
        buttonTextPl: buttonText || "Odkryj",
        link: link || "/shop",
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(heroSettings);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("ADMIN HERO POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create hero settings" },
      { status: 500 }
    );
  }
}

