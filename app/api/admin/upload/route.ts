export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

/**
 * POST /api/admin/upload
 * Przesyła plik do Supabase Storage bucket product-images
 */
export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const purpose = formData.get("purpose");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const isVideo = VIDEO_TYPES.includes(file.type);
    const isImage = IMAGE_TYPES.includes(file.type);

    if (isVideo && purpose !== "hero") {
      return NextResponse.json(
        { error: "Filmy można wgrywać tylko do hero." },
        { status: 400 }
      );
    }

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Dozwolone są JPEG, PNG, WebP oraz filmy MP4 i WebM." },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Film jest za duży. Maksymalnie 30 MB."
            : "Plik jest za duży. Maksymalnie 5 MB.",
        },
        { status: 400 }
      );
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${fileName}`;

    // Konwertuj File do ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prześlij do Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Pobierz publiczny URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    // assertAdmin rzuca Response, więc jeśli to Response, zwróć go
    if (error instanceof Response) {
      return error;
    }

    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

