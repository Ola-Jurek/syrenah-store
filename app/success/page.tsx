"use client";

import { Suspense } from "react";
import { OrderSuccessContent } from "@/components/OrderSuccessContent";
import { useLanguage } from "@/components/LanguageContext";

function SuccessFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
      {t("common.loadingConfirm")}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
