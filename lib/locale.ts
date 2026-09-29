export type Locale = "pl" | "en";

export const LOCALE_STORAGE_KEY = "syrenah_locale";

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "pl" || v === "en";
}
