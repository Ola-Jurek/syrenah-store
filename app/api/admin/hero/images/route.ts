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
    const { imageUrl, mediaType, viewport } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const kind = mediaType === "video" ? "video" : "image";
    const target = viewport === "desktop" ? "desktop" : "mobile";

    // Znajdź lub utwórz HeroSettings
    let heroSettings = await prisma.heroSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!heroSettings) {
      heroSettings = await prisma.heroSettings.create({
        data: {
          titlePl: "Nowa Kolekcja",
          buttonTextPl: "Odkryj",
          link: "/shop",
        },
      });
    }

    const existing = await prisma.heroImage.findMany({
      where: { heroSettingsId: heroSettings.id, viewport: target },
      select: { mediaType: true },
    });

    if (existing.some((item) => item.mediaType !== kind)) {
      return NextResponse.json(
        { error: "Na tym widoku jest już drugi typ pliku. Usuń go, zanim wgrasz inny." },
        { status: 400 }
      );
    }

    if (kind === "video" && existing.some((item) => item.mediaType === "video")) {
      return NextResponse.json(
        { error: "Na tym widoku może być tylko jeden film." },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.heroImage.aggregate({
      where: { heroSettingsId: heroSettings.id, viewport: target },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    const heroImage = await prisma.heroImage.create({
      data: {
        imageUrl,
        mediaType: kind,
        viewport: target,
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

