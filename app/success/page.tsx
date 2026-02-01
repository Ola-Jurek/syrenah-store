"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const hasProcessed = useRef(false);
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    // ✅ tylko UI + local state
    clearCart();
    setIsProcessing(false);
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl md:text-4xl font-serif mb-4">
        Dziękujemy za zamówienie 🤍
      </h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Twoja płatność została przyjęta. Wkrótce otrzymasz potwierdzenie
        zamówienia.
      </p>

      <a
        href="/shop"
        className={`border border-black px-8 py-3 text-sm uppercase tracking-wide transition
          ${
            isProcessing
              ? "opacity-50 pointer-events-none"
              : "hover:bg-black hover:text-white"
          }
        `}
      >
        Wróć do sklepu
      </a>
    </div>
  );
}
