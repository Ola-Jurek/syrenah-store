"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_KEY = "syrenah_cookies_accepted";

/** Sprawdza, czy cookies zostały zaakceptowane (do użycia przez inne komponenty) */
export function areCookiesAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_KEY) === "true";
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pokaż banner tylko jeśli cookies nie zostały jeszcze zaakceptowane
    if (!areCookiesAccepted()) {
      // Krótkie opóźnienie, żeby strona zdążyła się wyrenderować
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setIsVisible(false);
    // Emituj event, aby NewsletterPopup mógł zareagować
    window.dispatchEvent(new Event("cookies-accepted"));
  };

  if (!isVisible) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-[9990]
        bg-[#FAF8F5] border-t border-[#E8E3D8]
        animate-slide-up
      "
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tekst */}
        <p className="text-xs text-neutral-500 leading-relaxed text-center sm:text-left">
          Nasza strona korzysta z plików cookies, aby zapewnić Ci najwyższą
          jakość usług. Korzystając ze sklepu, akceptujesz naszą{" "}
          <Link
            href="/polityka-prywatnosci"
            className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C] transition-colors"
          >
            politykę prywatności
          </Link>
          .
        </p>

        {/* Przycisk */}
        <button
          onClick={handleAccept}
          className="
            shrink-0
            bg-[#C1A88C] text-white
            px-8 py-2.5
            text-xs uppercase tracking-widest
            hover:bg-[#B09A7C]
            transition-colors
          "
        >
          Akceptuję
        </button>
      </div>
    </div>
  );
}
