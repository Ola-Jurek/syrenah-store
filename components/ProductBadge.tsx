"use client";

import { cn } from "@/lib/utils";

type BadgeType = "NEW" | "SALE" | "SOLD_OUT";

type Props = {
  createdAt?: string | Date;
  stock?: number;
  /** Czy finalPrice < originalPrice (wyliczone przez getEffectivePrice) */
  hasPriceReduction?: boolean;
  /**
   * Etykieta rabatu z obiektu Discount (np. "WALENTYNKI" lub "-10%").
   * Jeśli podana i hasPriceReduction=true → wyświetli tę etykietę zamiast "SALE".
   * Jeśli brak (obniżka pochodzi tylko z salePrice) → wyświetli "SALE".
   */
  discountLabel?: string | null;
};

function getBadge(props: Props): BadgeType | null {
  // SOLD OUT has highest priority
  if (props.stock !== undefined && props.stock <= 0) {
    return "SOLD_OUT";
  }

  // SALE - finalPrice < originalPrice
  if (props.hasPriceReduction) {
    return "SALE";
  }

  // NEW - if created within last 14 days
  if (props.createdAt) {
    const created = new Date(props.createdAt);
    const now = new Date();
    const diffDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 14) {
      return "NEW";
    }
  }

  return null;
}

const badgeStyles: Record<BadgeType, string> = {
  NEW: "bg-[#C1A88C] text-white",
  SALE: "bg-[#D4A0A0] text-white",
  SOLD_OUT: "bg-black/40 text-white backdrop-blur-sm",
};

const badgeLabels: Record<BadgeType, string> = {
  NEW: "NEW",
  SALE: "SALE",
  SOLD_OUT: "SOLD OUT",
};

export function ProductBadge(props: Props) {
  const badge = getBadge(props);

  if (!badge) return null;

  // Inteligentna etykieta: jeśli mamy discountLabel i badge to SALE, użyj go
  const label =
    badge === "SALE" && props.discountLabel
      ? props.discountLabel
      : badgeLabels[badge];

  return (
    <span
      className={cn(
        "absolute top-2 left-2 z-10 px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium rounded-sm",
        badgeStyles[badge]
      )}
    >
      {label}
    </span>
  );
}

export function useIsSoldOut(stock?: number) {
  return stock !== undefined && stock <= 0;
}
