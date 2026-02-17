"use client";


import { Suspense } from 'react';
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const hasProcessed = useRef(false);
  const { clearCart } = useCart();

  // Natychmiast wyczyść localStorage (synchronicznie, bez czekania na efekty)
  if (typeof window !== "undefined" && sessionId && !hasProcessed.current) {
    localStorage.removeItem("cart");
    localStorage.removeItem("syrenah_shipping");
  }

  useEffect(() => {
    if (!sessionId) return;
    if (hasProcessed.current) return;

    hasProcessed.current = true;
    clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl md:text-4xl font-serif mb-4">
        Dziękujemy za zamówienie 🤍
      </h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Twoja płatność została przyjęta. Wkrótce otrzymasz potwierdzenie
        zamówienia.
      </p>

      <a
        href="/shop"
        className="border border-black px-8 py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition"
      >
        Wróć do sklepu
      </a>
    </div>
  );
}


export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Ładowanie potwierdzenia...</div>}>
      <SuccessContent />
    </Suspense>
  );
}