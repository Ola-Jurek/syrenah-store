export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/hero/images
 * Dodaje nowe zdjęcie do Hero
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Znajdź lub utwórz HeroSettings
    let heroSettings = await prisma.heroSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!heroSettings) {
      heroSettings = await prisma.heroSettings.create({
        data: {
          title: "Nowa Kolekcja",
          buttonText: "Odkryj",
          link: "/shop",
        },
      });
    }

    // Znajdź najwyższy order
    const maxOrder = await prisma.heroImage.aggregate({
      where: { heroSettingsId: heroSettings.id },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    // Dodaj nowe zdjęcie
    const heroImage = await prisma.heroImage.create({
      data: {
        imageUrl,
        order: newOrder,
        heroSettingsId: heroSettings.id,
      },
    });

    return NextResponse.json(heroImage);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("ADMIN HERO IMAGE POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add hero image" },
      { status: 500 }
    );
  }
}

