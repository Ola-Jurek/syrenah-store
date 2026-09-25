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

export function isPolandCountry(code: string | undefined | null) {
  return !code || code === "PL";
}

export function countryLabel(code: string | undefined | null, locale: string) {
  const match = SHIPPING_COUNTRIES.find((country) => country.code === code);
  if (!match) return code || "";
  return locale === "en" ? match.en : match.pl;
}
