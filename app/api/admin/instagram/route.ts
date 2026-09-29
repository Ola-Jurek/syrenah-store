export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import {
  createInstagramPhoto,
  listInstagramPhotos,
} from "@/lib/instagramPhotos";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const photos = await listInstagramPhotos();
    return NextResponse.json({ photos });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN INSTAGRAM GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load photos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const photo = await createInstagramPhoto(imageUrl);
    return NextResponse.json(photo);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN INSTAGRAM POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add photo" },
      { status: 500 }
    );
  }
}
