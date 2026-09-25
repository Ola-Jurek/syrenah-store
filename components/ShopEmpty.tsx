"use client";

import { useLanguage } from "@/components/LanguageContext";

export function ShopEmpty() {
  const { t } = useLanguage();
  return <p className="text-muted-foreground">{t("shop.preparing")}</p>;
}
