export const SHIPPING_COUNTRIES = [
  { code: "PL", pl: "Polska", en: "Poland" },
  { code: "DE", pl: "Niemcy", en: "Germany" },
  { code: "CZ", pl: "Czechy", en: "Czechia" },
  { code: "SK", pl: "Słowacja", en: "Slovakia" },
  { code: "AT", pl: "Austria", en: "Austria" },
  { code: "FR", pl: "Francja", en: "France" },
  { code: "NL", pl: "Holandia", en: "Netherlands" },
  { code: "BE", pl: "Belgia", en: "Belgium" },
  { code: "IT", pl: "Włochy", en: "Italy" },
  { code: "ES", pl: "Hiszpania", en: "Spain" },
  { code: "LT", pl: "Litwa", en: "Lithuania" },
  { code: "LV", pl: "Łotwa", en: "Latvia" },
  { code: "EE", pl: "Estonia", en: "Estonia" },
  { code: "SE", pl: "Szwecja", en: "Sweden" },
  { code: "DK", pl: "Dania", en: "Denmark" },
  { code: "GB", pl: "Wielka Brytania", en: "United Kingdom" },
  { code: "IE", pl: "Irlandia", en: "Ireland" },
  { code: "PT", pl: "Portugalia", en: "Portugal" },
  { code: "HU", pl: "Węgry", en: "Hungary" },
  { code: "RO", pl: "Rumunia", en: "Romania" },
] as const;

export type ShippingCountryCode = (typeof SHIPPING_COUNTRIES)[number]["code"];

export const DOMESTIC_SHIPPING_PLN = 19;
export const INTERNATIONAL_COURIER_PLN = 69;

export function isPolandCountry(code: string | undefined | null) {
  return !code || code === "PL";
}

export function destinationCountry(input: {
  country?: string | null;
  differentShipping?: boolean;
  altCountry?: string | null;
}) {
  if (input.differentShipping) {
    return input.altCountry || input.country || "PL";
  }
  return input.country || "PL";
}

export function shippingPricePln(
  method: string | undefined | null,
  destination: string | undefined | null
) {
  if (method === "pickup" && isPolandCountry(destination)) {
    return 0;
  }
  if (method === "parcel_locker" && isPolandCountry(destination)) {
    return DOMESTIC_SHIPPING_PLN;
  }
  return isPolandCountry(destination)
    ? DOMESTIC_SHIPPING_PLN
    : INTERNATIONAL_COURIER_PLN;
}

export function countryLabel(code: string | undefined | null, locale: string) {
  const match = SHIPPING_COUNTRIES.find((country) => country.code === code);
  if (!match) return code || "";
  return locale === "en" ? match.en : match.pl;
}
