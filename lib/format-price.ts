import type { Locale } from "@/lib/locale";

export function formatMoney(amount: number, locale: Locale): string {
  const n = Math.round(amount * 100) / 100;
  if (locale === "en") {
    return `${n.toFixed(2)} EUR`;
  }
  return `${n.toFixed(2)} PLN`;
}
