import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export type InstagramPhotoRow = {
  id: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Odczyt i zapis idą przez SQL, bo działający proces Nexta blokuje
 * regenerację klienta Prismy i `prisma.instagramPhoto` bywa niedostępne.
 */
export async function listInstagramPhotos(): Promise<InstagramPhotoRow[]> {
  return prisma.$queryRaw<InstagramPhotoRow[]>`
    SELECT
      id,
      image_url AS "imageUrl",
      sort_order AS "sortOrder",
      "createdAt",
      "updatedAt"
    FROM instagram_photos
    ORDER BY sort_order ASC, "createdAt" ASC
  `;
}

export async function createInstagramPhoto(imageUrl: string): Promise<InstagramPhotoRow> {
  const rows = await prisma.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX(sort_order) AS max FROM instagram_photos
  `;
  const sortOrder = (rows[0]?.max ?? -1) + 1;
  const id = randomUUID();

  const created = await prisma.$queryRaw<InstagramPhotoRow[]>`
    INSERT INTO instagram_photos (id, image_url, sort_order, "createdAt", "updatedAt")
    VALUES (${id}, ${imageUrl}, ${sortOrder}, NOW(), NOW())
    RETURNING
      id,
      image_url AS "imageUrl",
      sort_order AS "sortOrder",
      "createdAt",
      "updatedAt"
  `;

  return created[0];
}

export async function deleteInstagramPhoto(id: string): Promise<boolean> {
  const deleted = await prisma.$executeRaw`
    DELETE FROM instagram_photos WHERE id = ${id}
  `;
  return deleted > 0;
}
