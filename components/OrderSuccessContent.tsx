"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import { useLanguage } from "@/components/LanguageContext";

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const hasProcessed = useRef(false);
  const { status } = useSession();
  const { clearCart } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    if (!sessionId || status === "loading" || hasProcessed.current) return;

    hasProcessed.current = true;
    localStorage.removeItem("syrenah_shipping");
    localStorage.removeItem("syrenah_discount_code");
    void clearCart();
  }, [sessionId, status, clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl md:text-4xl font-serif mb-4">
        {t("orderSuccess.title")}
      </h1>

      <p className="text-muted-foreground max-w-md mb-8">
        {t("orderSuccess.body")}
      </p>

      <Link
        href="/shop"
        className="border border-black px-8 py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition"
      >
        {t("orderSuccess.backToShop")}
      </Link>
    </div>
  );
}
