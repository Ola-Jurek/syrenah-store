"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CheckoutGatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items } = useCart();

  // Jeśli zalogowany — od razu dalej
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/checkout/shipping");
    }
  }, [status, router]);

  // Spinner: sesja się ładuje LUB użytkownik zalogowany (zaraz nastąpi redirect)
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-5 h-5 border border-[#C1A88C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pusty koszyk — wróć do sklepu
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
        <h1 className="font-serif text-xl text-neutral-800 mb-3">
          Twój koszyk jest pusty
        </h1>
        <p className="text-xs text-neutral-400 mb-8">
          Dodaj produkty, aby przejść do zamówienia.
        </p>
        <Link
          href="/shop"
          className="border border-neutral-900 px-8 py-3 text-xs uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          Wróć do sklepu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 bg-[#FDFBF7]">
      <div className="w-full max-w-md">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-8 h-8 rounded-full bg-[#C1A88C] text-white flex items-center justify-center text-xs font-medium">
            1
          </span>
          <div className="w-8 h-px bg-neutral-300" />
          <span className="w-8 h-8 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center text-xs">
            2
          </span>
          <div className="w-8 h-px bg-neutral-300" />
          <span className="w-8 h-8 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center text-xs">
            3
          </span>
        </div>

        {/* Nagłówek */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl text-neutral-800 mb-3">
            Jak chcesz kontynuować?
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Zaloguj się, aby mieć dostęp do historii zamówień,
            <br />
            lub kontynuuj jako gość.
          </p>
        </div>

        {/* Opcje */}
        <div className="space-y-4">
          {/* Zaloguj się */}
          <Link
            href="/login?callbackUrl=/checkout/shipping"
            className="group block w-full border border-[#C1A88C] bg-white p-5 transition-all hover:bg-[#C1A88C]/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800 mb-1">
                  Zaloguj się
                </p>
                <p className="text-xs text-neutral-400">
                  Masz konto? Zaloguj się lub zarejestruj.
                </p>
              </div>
              <svg
                className="w-4 h-4 text-[#C1A88C] group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </Link>

          {/* Kontynuuj jako gość */}
          <Link
            href="/checkout/shipping"
            className="group block w-full border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:bg-neutral-50/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800 mb-1">
                  Kontynuuj jako gość
                </p>
                <p className="text-xs text-neutral-400">
                  Złóż zamówienie bez zakładania konta.
                </p>
              </div>
              <svg
                className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-300">
            lub
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Link do rejestracji */}
        <div className="text-center">
          <p className="text-xs text-neutral-400">
            Nie masz konta?{" "}
            <Link
              href="/register?callbackUrl=/checkout/shipping"
              className="text-neutral-600 hover:text-neutral-800 underline underline-offset-2 transition-colors"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
