"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  totalProducts: number;
  currentSort: string;
};

const sortOptions = [
  { value: "newest", labelPl: "Najnowsze", labelEn: "Newest" },
  { value: "price_asc", labelPl: "Cena ↑", labelEn: "Price ↑" },
  { value: "price_desc", labelPl: "Cena ↓", labelEn: "Price ↓" },
];

export function ShopClientWrapper({ totalProducts, currentSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-[#C1A88C]/10">
      {/* Product count */}
      <p className="text-xs text-black/50 uppercase tracking-widest">
        {totalProducts}{" "}
        {totalProducts === 1
          ? "produkt"
          : totalProducts < 5
          ? "produkty"
          : "produktów"}
      </p>

      {/* Sort options */}
      <div className="flex items-center gap-4">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSort(option.value)}
            className={cn(
              "text-xs uppercase tracking-widest transition-colors",
              currentSort === option.value
                ? "text-[#C1A88C] font-medium"
                : "text-black/40 hover:text-black/70"
            )}
          >
            {option.labelPl}
          </button>
        ))}
      </div>
    </div>
  );
}
