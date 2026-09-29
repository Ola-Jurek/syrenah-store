"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

const COOKIE_KEY = "syrenah_cookies_accepted";

export function areCookiesAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_KEY) === "true";
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { messages } = useLanguage();

  useEffect(() => {
    if (!areCookiesAccepted()) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setIsVisible(false);
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
        <p className="text-xs text-neutral-500 leading-relaxed text-center sm:text-left">
          {messages.cookie.textPrefix}{" "}
          <Link
            href="/polityka-prywatnosci"
            className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C] transition-colors"
          >
            {messages.cookie.privacyLink}
          </Link>
          .
        </p>

        <button
          type="button"
          onClick={handleAccept}
          className="
            flex-shrink-0 px-6 py-2.5 text-xs uppercase tracking-widest
            bg-[#C1A88C] text-white hover:bg-[#B09A7C] transition-colors
            rounded-sm
          "
        >
          {messages.cookie.accept}
        </button>
      </div>
    </div>
  );
}
