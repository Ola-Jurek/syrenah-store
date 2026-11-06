export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { buildFeedRow, rowsToCsv } from "@/lib/meta-feed";

const SITE_URL = "https://syrenahthelabel.com";

/**
 * GET /api/feeds/meta
 * Feed produktowy (CSV) dla Meta Commerce Manager. Publiczny, dane czytane na żywo z bazy.
 */
export async function GET() {
  try {
    const now = new Date();

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        category: { select: { slug: true } },
        images: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          select: { url: true, isPrimary: true },
        },
        sizeStocks: { select: { size: true, stock: true } },
        discounts: {
          where: {
            isActive: true,
            validFrom: { lte: now },
            OR: [{ validUntil: null }, { validUntil: { gte: now } }],
          },
          take: 1,
          select: { type: true, value: true },
        },
      },
    });

    const rows = products
      .map((product) => buildFeedRow(product, SITE_URL))
      .filter((row): row is NonNullable<typeof row> => row !== null);

    return new Response(rowsToCsv(rows), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=900",
      },
    });
  } catch (error) {
    console.error("META FEED ERROR:", error);
    return new Response("Feed unavailable", { status: 500 });
  }
}
