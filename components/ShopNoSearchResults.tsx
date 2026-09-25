"use client";

import { useLanguage } from "@/components/LanguageContext";

export function ShopNoSearchResults({ term }: { term: string }) {
  const { t } = useLanguage();
  return (
    <p className="text-muted-foreground">
      {t("shop.noResults")} &quot;{term}&quot;
    </p>
  );
}
