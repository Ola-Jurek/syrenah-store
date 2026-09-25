export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/adminAuth";
import { deleteInstagramPhoto } from "@/lib/instagramPhotos";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
    const deleted = await deleteInstagramPhoto(id);

    if (!deleted) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("ADMIN INSTAGRAM DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
