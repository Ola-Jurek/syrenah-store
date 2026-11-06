import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = "https://syrenahthelabel.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/o-nas",
    "/kontakt",
    "/regulamin",
    "/polityka-prywatnosci",
    "/zwroty-i-reklamacje",
  ];

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({
        select: {
          slug: true,
          updatedAt: true,
          category: { select: { slug: true } },
        },
      }),
    ]);

    for (const c of categories) {
      entries.push({
        url: `${base}/shop/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const p of products) {
      entries.push({
        url: `${base}/shop/${p.category.slug}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap: DB error", e);
  }

  return entries;
}
