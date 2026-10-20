"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

const CHOICE_KEY = "syrenah_cookie_choice";
const LEGACY_KEY = "syrenah_cookies_accepted";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

function readChoice(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CHOICE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.necessary !== true) return null;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

export function hasCookieChoice(): boolean {
  return readChoice() !== null;
}

export function hasMarketingConsent(): boolean {
  return readChoice()?.marketing === true;
}

/** Decyzja o cookies już zapadła (także „tylko niezbędne”). */
export function areCookiesAccepted(): boolean {
  return hasCookieChoice();
}

function saveChoice(choice: CookieConsent) {
  localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event("cookies-accepted"));
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const { messages } = useLanguage();
  const copy = messages.cookie;

  useEffect(() => {
    const open = (event?: Event) => {
      const saved = readChoice();
      setAnalytics(saved?.analytics === true);
      setMarketing(saved?.marketing === true);
      setDetailsOpen(event?.type === "open-cookie-settings");
      setIsVisible(true);
    };

    if (!hasCookieChoice()) {
      const timer = setTimeout(open, 500);
      window.addEventListener("open-cookie-settings", open);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("open-cookie-settings", open);
      };
    }

    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const persist = (next: CookieConsent) => {
    saveChoice(next);
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] bg-[#FAF8F5] border-t border-[#E8E3D8] animate-slide-up">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex flex-col gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <p className="min-w-0 text-xs text-neutral-500 leading-relaxed sm:max-w-2xl">
            {copy.text}
            <span className="block mt-1">
              {copy.more}{" "}
              <Link
                href="/polityka-prywatnosci"
                className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C] transition-colors"
              >
                {copy.privacyLink}
              </Link>
              .
            </span>
          </p>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="shrink-0 self-start px-2.5 py-1 text-[10px] uppercase tracking-widest leading-none text-[#8C7358] border border-[#E8E3D8] rounded-sm hover:border-[#C1A88C] transition-colors"
          >
            {copy.settings}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:justify-start">
          <BannerButton
            primary
            onClick={() => persist({ necessary: true, analytics: true, marketing: true })}
          >
            {copy.acceptAll}
          </BannerButton>
          <BannerButton
            onClick={() => persist({ necessary: true, analytics: false, marketing: false })}
          >
            {copy.necessaryOnly}
          </BannerButton>
        </div>
      </div>

      {detailsOpen && (
        <div className="max-w-5xl mx-auto px-5 pb-4">
          <div className="border-t border-[#E8E3D8] pt-3 flex flex-col gap-2">
            <Choice checked disabled title={copy.necessary} description={copy.necessaryDesc} />
            <Choice
              checked={analytics}
              title={copy.analytics}
              description={copy.analyticsDesc}
              onChange={setAnalytics}
            />
            <Choice
              checked={marketing}
              title={copy.marketing}
              description={copy.marketingDesc}
              onChange={setMarketing}
            />
            <div className="pt-1">
              <BannerButton onClick={() => persist({ necessary: true, analytics, marketing })}>
                {copy.save}
              </BannerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Choice({
  checked,
  disabled,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className={`flex items-baseline gap-2.5 text-xs ${disabled ? "opacity-70" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="accent-[#C1A88C]"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="uppercase tracking-widest text-[11px] text-neutral-700">{title}</span>
      <span className="text-[11px] text-neutral-500 normal-case tracking-normal">{description}</span>
    </label>
  );
}

function BannerButton({
  children,
  onClick,
  primary,
  className,
}: {
  children: string;
  onClick: () => void;
  primary?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full sm:w-auto px-4 py-2.5 text-[11px] uppercase tracking-widest text-center rounded-sm transition-colors ${
        primary
          ? "bg-[#C1A88C] text-white hover:bg-[#B09A7C]"
          : "border border-[#C1A88C] text-[#8C7358] hover:bg-[#C1A88C]/10"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
