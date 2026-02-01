"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) return;

    console.log("CLEARING CART NOW");
    // Wyczyść koszyk natychmiast po wejściu na stronę success
    clearCart();

    // Opcjonalnie: wyślij request do API (webhook powinien już to obsłużyć)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch((err) => {
      // Ignoruj błędy - webhook już obsłużył zamówienie
      console.log("Order API call failed (webhook should have handled it):", err);
    });
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
