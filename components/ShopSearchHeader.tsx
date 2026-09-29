"use client";

import { useLanguage } from "@/components/LanguageContext";

export function ShopSearchHeader({
  term,
  count,
}: {
  term: string;
  count: number;
}) {
  const { t, messages } = useLanguage();
  const word =
    count === 1 ? messages.shop.product : messages.shop.products;

  return (
    <>
      <h1 className="text-xs uppercase tracking-widest mb-4 text-black font-medium">
        {t("shop.searchTitle")} &quot;{term.toUpperCase()}&quot;
      </h1>
      <p className="text-xs text-black/60 mb-12">
        {t("shop.foundOne")} {count} {word}
      </p>
    </>
  );
}
