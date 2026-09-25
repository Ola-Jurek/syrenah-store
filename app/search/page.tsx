"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function SearchPage() {
  const { t } = useLanguage();
  return (
    <div className="h-[60vh] flex items-center justify-center text-center px-6">
      <p className="text-lg text-foreground/60 font-light tracking-wide">
        {t("search.preparing")}
      </p>
    </div>
  );
}
