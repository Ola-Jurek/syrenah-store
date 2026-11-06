import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryShopView } from "@/components/CategoryShopView";
import {
  getEffectivePrice,
  extractDiscountInfo,
  extractDiscountLabel,
} from "@/lib/pricing";
import { sellableStock } from "@/lib/size-stock";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const data = await prisma.category.findUnique({
    where: { slug: category },
    select: { namePl: true, descriptionPl: true },
  });
  if (!data) return { title: "Kategoria nie znaleziona" };

  const description =
    data.descriptionPl?.trim().slice(0, 160) ||
    `${data.namePl} – kolekcja Syrenah. Ekskluzywna moda damska, polski design i najwyższa jakość.`;

  return {
    title: `${data.namePl} – moda damska`,
    description,
    alternates: { canonical: `/shop/${category}` },
    openGraph: { title: data.namePl, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryData = await prisma.category.findUnique({
    where: { slug: category },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            take: 5,
          },
          discounts: {
            where: {
              isActive: true,
              validFrom: { lte: new Date() },
              OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
            },
            take: 1,
          },
          sizeStocks: { select: { size: true, stock: true } },
        },
      },
    },
  });

  if (!categoryData) {
    notFound();
  }

  const cardProducts = categoryData.products.map((product) => {
    const primaryImage =
      product.images.find((img) => img.url?.trim()) || product.images[0];
    const discountInfo = extractDiscountInfo(product.discounts);
    const pricing = getEffectivePrice({
      pricePln: Number(product.pricePln),
      priceEur: Number(product.priceEur),
      salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
      salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
      discount: discountInfo,
    });

    return {
      id: product.id,
      namePl: product.namePl,
      nameEn: product.nameEn,
      slug: product.slug,
      image: primaryImage?.url ?? null,
      imageAlt: primaryImage?.altPl ?? null,
      imageAltEn: primaryImage?.altEn ?? null,
      createdAt: product.createdAt.toISOString(),
      stock: sellableStock(product.stock, product.sizes, product.sizeStocks),
      originalPrice: pricing.originalPricePln.toFixed(2),
      finalPrice: pricing.finalPricePln.toFixed(2),
      originalPriceEur: pricing.originalPriceEur.toFixed(2),
      finalPriceEur: pricing.finalPriceEur.toFixed(2),
      discountLabelPl: extractDiscountLabel(product.discounts, "PLN"),
      discountLabelEn: extractDiscountLabel(product.discounts, "EUR"),
    };
  });

  return (
    <CategoryShopView
      categorySlug={category}
      categoryNamePl={categoryData.namePl}
      categoryNameEn={categoryData.nameEn}
      descriptionPl={categoryData.descriptionPl}
      descriptionEn={categoryData.descriptionEn}
      products={cardProducts}
    />
  );
}
