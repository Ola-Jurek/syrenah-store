import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/HeroSection";
import { InstagramFeed } from "@/components/InstagramFeed";
import { HomeNewestSection } from "@/components/HomeNewestSection";
import {
  getEffectivePrice,
  extractDiscountInfo,
  extractDiscountLabel,
} from "@/lib/pricing";

export default async function Home() {
  const heroSettings = await prisma.heroSettings.findFirst({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  const newestProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      category: {
        select: { id: true, namePl: true, nameEn: true, slug: true },
      },
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
    },
  });

  const cardProducts = newestProducts.map((product) => {
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
      stock: product.stock,
      originalPrice: pricing.originalPricePln.toFixed(2),
      finalPrice: pricing.finalPricePln.toFixed(2),
      originalPriceEur: pricing.originalPriceEur.toFixed(2),
      finalPriceEur: pricing.finalPriceEur.toFixed(2),
      discountLabelPl: extractDiscountLabel(product.discounts, "PLN"),
      discountLabelEn: extractDiscountLabel(product.discounts, "EUR"),
      categorySlug: product.category.slug,
    };
  });

  return (
    <div className="bg-white">
      <HeroSection heroSettings={heroSettings} />

      <HomeNewestSection products={cardProducts} />

      <InstagramFeed />
    </div>
  );
}
