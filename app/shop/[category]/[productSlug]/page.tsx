import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";
import { ProductPageView } from "@/components/ProductPageView";
import { parseSizeChart } from "@/lib/size-chart";
import { alignSizeStocks, parseSizeLabels, sellableStock } from "@/lib/size-stock";
import { slugify } from "@/lib/slug";
import type { Metadata } from "next";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function resolveProductSlug(productSlug: string): Promise<string | null> {
  const decoded = safeDecode(productSlug).trim();
  const normalized = slugify(decoded);
  const candidates = [...new Set([decoded, normalized].filter(Boolean))];

  for (const slug of candidates) {
    const found = await prisma.product.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      select: { slug: true },
    });
    if (found) return found.slug;
  }

  return null;
}

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const slug = await resolveProductSlug(productSlug);

  const product = slug
    ? await prisma.product.findUnique({
        where: { slug },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      })
    : null;

  if (!product) {
    return {
      title: "Produkt nie znaleziony",
    };
  }

  const description = product.descriptionPl
    ? product.descriptionPl.length > 160
      ? product.descriptionPl.slice(0, 157) + "..."
      : product.descriptionPl
    : `Kup ${product.namePl} w Syrenah Store - ekskluzywna moda damska.`;

  const primaryImage = product.images[0]?.url;

  return {
    title: product.namePl,
    description,
    openGraph: {
      title: product.namePl,
      description: description,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.images[0]?.altPl || product.namePl,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.namePl,
      description: description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  const slug = await resolveProductSlug(productSlug);

  const product = slug
    ? await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          discounts: {
            where: {
              isActive: true,
              validFrom: { lte: new Date() },
              OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
            },
            take: 1,
          },
          sizeStocks: {
            select: { size: true, stock: true },
          },
        },
      })
    : null;

  if (!product) {
    notFound();
  }

  const sizes = parseSizeLabels(product.sizes);
  const colors = product.colors
    ? ((typeof product.colors === "string"
        ? JSON.parse(product.colors)
        : product.colors) as string[])
    : [];
  const sizeStocks = alignSizeStocks(sizes, product.sizeStocks);

  const discountInfo = extractDiscountInfo(product.discounts);
  const pricing = getEffectivePrice({
    pricePln: Number(product.pricePln),
    priceEur: Number(product.priceEur),
    salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
    salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
    discount: discountInfo,
  });

  return (
    <ProductPageView
      product={{
        id: product.id,
        namePl: product.namePl,
        nameEn: product.nameEn,
        slug: product.slug,
        descriptionPl: product.descriptionPl,
        descriptionEn: product.descriptionEn,
        stock: sellableStock(product.stock, product.sizes, product.sizeStocks),
        sizes,
        sizeStocks,
        colors,
        sizeChart: parseSizeChart(product.sizeChart),
        createdAt: product.createdAt.toISOString(),
        category: {
          slug: product.category.slug,
          namePl: product.category.namePl,
          nameEn: product.category.nameEn,
        },
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altPl: img.altPl,
          altEn: img.altEn,
          isPrimary: img.isPrimary,
        })),
        discounts: product.discounts.map((d) => ({
          type: d.type,
          value: d.value,
          namePl: d.namePl,
        })),
      }}
      pricing={{
        originalPricePln: pricing.originalPricePln,
        finalPricePln: pricing.finalPricePln,
        originalPriceEur: pricing.originalPriceEur,
        finalPriceEur: pricing.finalPriceEur,
        hasDiscount: pricing.hasDiscount,
      }}
    />
  );
}
