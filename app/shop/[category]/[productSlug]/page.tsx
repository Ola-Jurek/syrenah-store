import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";
import { ProductPageView } from "@/components/ProductPageView";
import { parseSizeChart } from "@/lib/size-chart";
import { alignSizeStocks, parseSizeLabels, sellableStock } from "@/lib/size-stock";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

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

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
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
  });

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
