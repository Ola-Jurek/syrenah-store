export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listInstagramPhotos } from "@/lib/instagramPhotos";

export async function GET() {
  try {
    const photos = await listInstagramPhotos();
    return NextResponse.json({
      photos: photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
      })),
    });
  } catch (error) {
    console.error("INSTAGRAM PHOTOS GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load photos" },
      { status: 500 }
    );
  }
}
