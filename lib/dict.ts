import type { Locale } from "@/lib/locale";
import pl from "@/dictionaries/pl.json";
import en from "@/dictionaries/en.json";

export type Messages = typeof pl;

const dictionaries: Record<Locale, Messages> = {
  pl,
  en,
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

/** Ścieżka kropkowa, np. "nav.home" */
export function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}
