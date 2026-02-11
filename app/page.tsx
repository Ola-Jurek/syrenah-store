import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/HeroSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { InstagramFeed } from "@/components/InstagramFeed";
import { ProductCard } from "@/components/ProductCard";
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

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  // Pobierz 10 najnowszych produktów
  const newestProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      category: {
        select: { id: true, namePl: true, nameEn: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection heroSettings={heroSettings} />

      {/* Nowości */}
      {newestProducts.length > 0 && (
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <h2 className="text-center font-serif text-2xl md:text-3xl tracking-[0.15em] text-black mb-12">
            NOWOŚCI
          </h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {newestProducts.map((product) => {
              const primaryImage = product.images[0];
              const discountInfo = extractDiscountInfo(product.discounts);
              const discountLabel = extractDiscountLabel(product.discounts);
              const pricing = getEffectivePrice({
                pricePln: Number(product.pricePln),
                priceEur: Number(product.priceEur),
                salePricePln: product.salePricePln
                  ? Number(product.salePricePln)
                  : null,
                salePriceEur: product.salePriceEur
                  ? Number(product.salePriceEur)
                  : null,
                discount: discountInfo,
              });

              return (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    namePl: product.namePl,
                    slug: product.slug,
                    image: primaryImage?.url ?? null,
                    imageAlt: primaryImage?.altPl ?? null,
                    createdAt: product.createdAt.toISOString(),
                    stock: product.stock,
                    originalPrice: pricing.originalPricePln.toFixed(2),
                    finalPrice: pricing.finalPricePln.toFixed(2),
                    discountLabel,
                  }}
                  categorySlug={product.category.slug}
                />
              );
            })}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
            >
              Zobacz wszystkie
            </Link>
          </div>
        </section>
      )}

      {/* Category Grid - zakomentowane, będzie odkomentowane gdy będzie więcej niż jedna kategoria */}
      {/* <CategoryGrid categories={categories} /> */}

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
}
