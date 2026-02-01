"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  
    const data = await res.json();
  
    console.log("CHECKOUT RESPONSE:", data);
  
    if (!data.url) {
      alert("Brak URL z backendu – sprawdź console");
      return;
    }
  
    window.location.href = data.url;
  };
  
  

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-serif mb-4">
          Checkout
        </h1>
        <p className="text-muted-foreground mb-6">
          Twój koszyk jest pusty.
        </p>
        <Link href="/shop" className="underline">
          Wróć do sklepu
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto grid gap-12 md:grid-cols-2">
      
      {/* LEFT: Customer details */}
      <div>
        <h1 className="text-3xl font-serif mb-8">
          Checkout
        </h1>

        <form className="space-y-6">
          <div>
            <label className="block text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="twoj@email.pl"
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Imię i nazwisko
            </label>
            <input
              type="text"
              placeholder="Jan Kowalski"
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Adres
            </label>
            <input
              type="text"
              placeholder="Ulica, numer, miasto"
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>
        </form>
      </div>

      {/* RIGHT: Order summary */}
      <div className="border rounded-xl p-6 h-fit">
        <h2 className="text-lg font-medium mb-6">
          Podsumowanie zamówienia
        </h2>

        <ul className="space-y-4 mb-6">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                {item.price * item.quantity} zł
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t pt-4 text-lg font-medium">
          <span>Suma</span>
          <span>{total} zł</span>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-6 w-full border border-black py-4 text-sm tracking-wide uppercase hover:bg-black hover:text-white transition"
        >
          Przejdź do płatności
        </button>

      </div>
    </div>
  );
}
