"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function CancelPage() {
  const { t } = useLanguage();
  return (
    <div className="px-6 py-16 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-serif mb-4">{t("checkoutCancel.title")}</h1>
      <p className="text-muted-foreground">{t("checkoutCancel.body")}</p>
    </div>
  );
}
