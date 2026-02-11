/**
 * Moduł obliczania efektywnej ceny produktu.
 *
 * Logika:
 * 1. Cena bazowa = salePrice (jeśli podana i mniejsza od price), inaczej price
 * 2. Jeśli istnieje aktywny Discount — odejmij rabat (% lub kwotę) od ceny bazowej
 * 3. Wynik = finalPrice — kwota, którą klient faktycznie płaci
 *
 * Obsługuje dwie waluty: PLN i EUR.
 */

export type DiscountInfo = {
  type: "PERCENTAGE" | "FIXED";
  value: number; // dla PERCENTAGE: np. 10 = 10%, dla FIXED: kwota w walucie bazowej
};

export type PricingInput = {
  pricePln: number;
  priceEur: number;
  salePricePln?: number | null;
  salePriceEur?: number | null;
  discount?: DiscountInfo | null;
};

export type PricingResult = {
  /** Cena regularna (bez żadnych obniżek) */
  originalPricePln: number;
  originalPriceEur: number;
  /** Ostateczna cena po uwzględnieniu salePrice i Discount */
  finalPricePln: number;
  finalPriceEur: number;
  /** Czy jest jakaś obniżka (salePrice lub discount) */
  hasDiscount: boolean;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function applyDiscount(basePrice: number, discount: DiscountInfo): number {
  if (discount.type === "PERCENTAGE") {
    return round2(basePrice * (1 - discount.value / 100));
  }
  // FIXED — odejmij kwotę, ale nie poniżej 0
  return round2(Math.max(0, basePrice - discount.value));
}

export function getEffectivePrice(input: PricingInput): PricingResult {
  const { pricePln, priceEur, salePricePln, salePriceEur, discount } = input;

  // 1. Cena bazowa — salePrice jeśli mniejsza od regularnej
  let basePln = pricePln;
  if (salePricePln != null && salePricePln > 0 && salePricePln < pricePln) {
    basePln = salePricePln;
  }

  let baseEur = priceEur;
  if (salePriceEur != null && salePriceEur > 0 && salePriceEur < priceEur) {
    baseEur = salePriceEur;
  }

  // 2. Zastosuj rabat z Discount (jeśli istnieje)
  let finalPln = basePln;
  let finalEur = baseEur;

  if (discount) {
    finalPln = applyDiscount(basePln, discount);
    finalEur = applyDiscount(baseEur, discount);
  }

  // 3. Wynik
  const hasDiscount = finalPln < pricePln || finalEur < priceEur;

  return {
    originalPricePln: round2(pricePln),
    originalPriceEur: round2(priceEur),
    finalPricePln: round2(finalPln),
    finalPriceEur: round2(finalEur),
    hasDiscount,
  };
}

/**
 * Wydobywa DiscountInfo z surowego obiektu rabatu z bazy.
 * Używane po include { discounts: { where: ... } }
 */
export function extractDiscountInfo(
  discounts: Array<{ type: string; value: any }> | undefined | null
): DiscountInfo | null {
  if (!discounts || discounts.length === 0) return null;
  const d = discounts[0];
  return {
    type: d.type as "PERCENTAGE" | "FIXED",
    value: Number(d.value),
  };
}

/**
 * Generuje czytelną etykietę dla badge produktu na podstawie danych Discount.
 * - Jeśli istnieje namePl → zwraca ją (np. "WALENTYNKI")
 * - W innym wypadku zwraca wartość (np. "-10%" lub "-50 PLN")
 * - Jeśli brak rabatu → zwraca null (badge pokaże "SALE" z salePrice)
 */
export function extractDiscountLabel(
  discounts: Array<{ type: string; value: any; namePl?: string | null }> | undefined | null
): string | null {
  if (!discounts || discounts.length === 0) return null;
  const d = discounts[0];

  if (d.namePl && d.namePl.trim()) {
    return d.namePl.trim().toUpperCase();
  }

  const val = Number(d.value);
  if (d.type === "PERCENTAGE") {
    return `-${val}%`;
  }
  return `-${val.toFixed(0)} PLN`;
}