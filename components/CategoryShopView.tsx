"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageContext";
import { ShopEmpty } from "@/components/ShopEmpty";
import type { ComponentProps } from "react";

type CardProduct = ComponentProps<typeof ProductCard>["product"];

export function CategoryShopView({
  categorySlug,
  categoryNamePl,
  categoryNameEn,
  products,
}: {
  categorySlug: string;
  categoryNamePl: string;
  categoryNameEn: string;
  products: CardProduct[];
}) {
  const { locale, t } = useLanguage();
  const catName =
    locale === "en" && categoryNameEn?.trim()
      ? categoryNameEn
      : categoryNamePl;

  return (
    <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
      <nav className="mb-16">
        <div className="flex items-center gap-2 text-xs text-[#C1A88C]/60">
          <Link href="/shop" className="hover:text-[#C1A88C] transition-colors">
            {t("product.shopCrumb")}
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <span className="text-[#C1A88C]/60">{catName.toUpperCase()}</span>
        </div>
      </nav>

      {products.length === 0 ? (
        <ShopEmpty />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
