"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageContext";

type Props = {
  currentFilter: string;
  currentSort: string;
  hasSaleProducts: boolean;
};

export function ShopFilters({
  currentFilter,
  currentSort,
  hasSaleProducts,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceOpen, setPriceOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, messages } = useLanguage();

  const filterOptions = useMemo(
    () =>
      [
        { value: "all", label: messages.shop.filterAll },
        { value: "new", label: messages.shop.filterNew },
        { value: "sale", label: messages.shop.filterSale },
      ] as const,
    [messages.shop]
  );

  const sortOptions = useMemo(
    () =>
      [
        { value: "newest", label: messages.shop.sortNewest },
        { value: "price_asc", label: messages.shop.sortPriceAsc },
        { value: "price_desc", label: messages.shop.sortPriceDesc },
      ] as const,
    [messages.shop]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setPriceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const buildUrl = (overrides: { filter?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    const filter = overrides.filter ?? currentFilter;
    if (filter && filter !== "all") {
      params.set("filter", filter);
    } else {
      params.delete("filter");
    }

    const sort = overrides.sort ?? currentSort;
    if (sort && sort !== "newest") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  const handleFilter = (value: string) => {
    router.push(buildUrl({ filter: value }));
  };

  const handleSort = (value: string) => {
    setPriceOpen(false);
    router.push(buildUrl({ sort: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 pb-4 border-b border-[#C1A88C]/10">
      {filterOptions
        .filter((opt) => opt.value !== "sale" || hasSaleProducts)
        .map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFilter(opt.value)}
            className={cn(
              "text-xs uppercase tracking-widest transition-colors",
              currentFilter === opt.value
                ? "text-[#C1A88C] font-medium"
                : "text-black/40 hover:text-black/70"
            )}
          >
            {opt.label}
          </button>
        ))}

      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setPriceOpen((v) => !v)}
          className={cn(
            "flex items-center gap-1 text-xs uppercase tracking-widest transition-colors",
            currentSort !== "newest"
              ? "text-[#C1A88C] font-medium"
              : "text-black/40 hover:text-black/70"
          )}
        >
          {messages.shop.sortPriceLabel}
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              priceOpen && "rotate-180"
            )}
          />
        </button>

        {priceOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#C1A88C]/15 shadow-sm z-20 min-w-[160px]">
            {sortOptions
              .filter((o) => o.value !== "newest")
              .map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSort(opt.value)}
                  className={cn(
                    "block w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest transition-colors",
                    currentSort === opt.value
                      ? "text-[#C1A88C] font-medium bg-[#C1A88C]/5"
                      : "text-black/50 hover:text-black/80 hover:bg-[#C1A88C]/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            {currentSort !== "newest" && (
              <button
                type="button"
                onClick={() => handleSort("newest")}
                className="block w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest text-black/30 hover:text-black/60 hover:bg-[#C1A88C]/5 border-t border-[#C1A88C]/10"
              >
                {t("shop.sortReset")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
