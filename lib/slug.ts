/** Adres w sklepie: małe litery, cyfry i myślniki. Spacja w slugu daje 404. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
