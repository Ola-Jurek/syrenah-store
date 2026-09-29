import type { Locale } from "@/lib/locale";
import { formatMoney } from "@/lib/format-price";

export type PricedCartLine = {
  price: number;
  priceEur?: number;
  quantity: number;
};

export function cartSubtotals(items: PricedCartLine[]) {
  const subPln = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const subEur = items.reduce((s, i) => s + (i.priceEur ?? 0) * i.quantity, 0);
  const canUseEur =
    items.length > 0 && items.every((i) => i.priceEur != null && !Number.isNaN(i.priceEur));
  return { subPln, subEur, canUseEur };
}

/** Przelicza kwotę w PLN (np. dostawa) na EUR wg proporcji koszyka produktów. */
export function plnToEurUsingRatio(
  plnAmount: number,
  subPln: number,
  subEur: number
): number | null {
  if (subPln <= 0 || subEur <= 0) return null;
  return Math.round(((plnAmount * subEur) / subPln) * 100) / 100;
}

export function formatCheckoutMoney(
  amountPln: number,
  amountEur: number | null,
  locale: Locale
): string {
  if (locale === "en" && amountEur != null) {
    return formatMoney(amountEur, "en");
  }
  return formatMoney(amountPln, "pl");
}
