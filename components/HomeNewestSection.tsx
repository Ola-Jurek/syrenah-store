"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageContext";
import type { ComponentProps } from "react";

type CardProduct = ComponentProps<typeof ProductCard>["product"];

export function HomeNewestSection({
  products,
}: {
  products: Array<CardProduct & { categorySlug: string }>;
}) {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="px-6 py-16 max-w-7xl mx-auto">
      <h2 className="text-center font-serif text-2xl md:text-3xl tracking-[0.15em] text-black mb-12">
        {t("home.newest")}
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {products.map(({ categorySlug, ...product }) => (
          <ProductCard
            key={product.id}
            product={product}
            categorySlug={categorySlug}
          />
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Link
          href="/shop"
          className="text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
        >
          {t("home.seeAll")}
        </Link>
      </div>
    </section>
  );
}
