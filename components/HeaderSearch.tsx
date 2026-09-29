"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageContext";
import { formatMoney } from "@/lib/format-price";

type SearchProduct = {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
  pricePln: number;
  priceEur: number;
  category: { slug: string; namePl: string; nameEn: string };
  primaryImage: { url: string } | null;
};

type Props = {
  /** desktop = expands left of icon; mobile = panel under header */
  variant: "desktop" | "mobile";
  className?: string;
};

export function HeaderSearch({ variant, className }: Props) {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setLoading(false);
  }, []);

  const openSearch = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        close();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Live search with debounce
  useEffect(() => {
    if (!open) return;

    const term = query.trim();
    if (term.length < 1) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(term)}`
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setHasSearched(true);
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, open]);

  const goToShopSearch = () => {
    const term = query.trim();
    if (!term) return;
    router.push(`/shop?search=${encodeURIComponent(term)}`);
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToShopSearch();
  };

  const productName = (p: SearchProduct) =>
    locale === "en" && p.nameEn?.trim() ? p.nameEn : p.namePl;

  const productHref = (p: SearchProduct) =>
    `/shop/${p.category.slug}/${p.slug}`;

  const resultsPanel = open && query.trim().length > 0 && (
    <div
      className={cn(
        "bg-white border border-[#E8E3D8] shadow-sm overflow-hidden",
        variant === "desktop"
          ? "absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-2rem))] z-50"
          : "border-t-0 max-h-[60vh] overflow-y-auto"
      )}
    >
      {loading && (
        <p className="px-4 py-3 text-xs text-black/40 tracking-wide">
          {t("search.searching")}
        </p>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <p className="px-4 py-3 text-xs text-black/40 tracking-wide">
          {t("search.noResults")}
        </p>
      )}

      {!loading && results.length > 0 && (
        <ul>
          {results.map((p) => (
            <li key={p.id}>
              <Link
                href={productHref(p)}
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#FDFBF7] transition-colors"
              >
                <div className="relative w-12 h-14 bg-[#C1A88C]/10 flex-shrink-0 overflow-hidden">
                  {p.primaryImage?.url ? (
                    <Image
                      src={p.primaryImage.url}
                      alt={productName(p)}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-800 truncate font-serif">
                    {productName(p)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formatMoney(
                      locale === "en" ? p.priceEur : p.pricePln,
                      locale
                    )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && results.length > 0 && (
        <button
          type="button"
          onClick={goToShopSearch}
          className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-widest text-neutral-500 hover:text-neutral-800 border-t border-[#E8E3D8] transition-colors"
        >
          {t("search.viewAll")}
        </button>
      )}
    </div>
  );

  if (variant === "desktop") {
    return (
      <div ref={rootRef} className={cn("relative flex items-center", className)}>
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300 ease-out",
            open ? "w-52 opacity-100 mr-1" : "w-0 opacity-0 mr-0"
          )}
        >
          <label htmlFor={inputId} className="sr-only">
            {t("nav.searchAria")}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            className="w-full bg-transparent border-0 border-b border-foreground/25 py-1.5 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/50 transition-colors"
            autoComplete="off"
          />
        </form>

        <button
          type="button"
          onClick={() => (open ? close() : openSearch())}
          className="p-2 text-foreground/70 hover:text-foreground transition-colors"
          aria-label={open ? t("search.close") : t("nav.searchAria")}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </button>

        {resultsPanel}
      </div>
    );
  }

  // Mobile
  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => (open ? close() : openSearch())}
        className="h-9 w-9 inline-flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        aria-label={open ? t("search.close") : t("nav.searchAria")}
        aria-expanded={open}
      >
        {open ? <Search className="h-5 w-5 text-foreground" /> : <Search className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-16 z-50 px-4 pb-2 bg-white border-b border-[#E8E3D8] shadow-sm">
          <form onSubmit={handleSubmit} className="pt-3 pb-2">
            <div className="flex items-center gap-2">
              <label htmlFor={inputId} className="sr-only">
                {t("nav.searchAria")}
              </label>
              <input
                id={inputId}
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="flex-1 bg-transparent border-0 border-b border-foreground/25 py-2 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/50 uppercase tracking-widest"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={close}
                className="p-1.5 text-foreground/50 hover:text-foreground"
                aria-label={t("search.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
          {resultsPanel}
        </div>
      )}
    </div>
  );
}
