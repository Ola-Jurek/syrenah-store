import { extractDiscountInfo, getEffectivePrice } from "@/lib/pricing";
import { sellableStock } from "@/lib/size-stock";

/**
 * Feed produktowy dla Meta Commerce Manager.
 * Na razie tylko PL / PLN — język i walutę podmienisz w FEED_LOCALE.
 */
export const FEED_LOCALE = {
  currency: "PLN",
  brand: "Syrenah",
  googleCategory: "Apparel & Accessories > Clothing",
} as const;

const DESCRIPTION_LIMIT = 5000;

export const FEED_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "sale_price",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "google_product_category",
] as const;

type FeedColumn = (typeof FEED_COLUMNS)[number];
type FeedRow = Record<FeedColumn, string>;

type FeedProduct = {
  id: string;
  namePl: string;
  descriptionPl: string | null;
  pricePln: unknown;
  priceEur: unknown;
  salePricePln: unknown;
  salePriceEur: unknown;
  stock: number;
  slug: string;
  sizes: unknown;
  category: { slug: string };
  images: Array<{ url: string; isPrimary: boolean }>;
  sizeStocks: Array<{ size: string; stock: number }>;
  discounts: Array<{ type: string; value: unknown }>;
};

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ${FEED_LOCALE.currency}`;
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function absoluteUrl(url: string, siteUrl: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${siteUrl}${trimmed}`;
  return null;
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Zwraca wiersz feedu albo null, jeśli produktu nie da się poprawnie opisać dla Meta. */
export function buildFeedRow(
  product: FeedProduct,
  siteUrl: string
): FeedRow | null {
  const pricePln = toNumber(product.pricePln);
  if (pricePln == null || pricePln <= 0) return null;

  const imageUrls = [...product.images]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map((image) => absoluteUrl(image.url ?? "", siteUrl))
    .filter((url): url is string => Boolean(url));
  if (imageUrls.length === 0) return null;

  const pricing = getEffectivePrice({
    pricePln,
    priceEur: toNumber(product.priceEur) ?? pricePln,
    salePricePln: toNumber(product.salePricePln),
    salePriceEur: toNumber(product.salePriceEur),
    discount: extractDiscountInfo(
      product.discounts as Array<{ type: string; value: unknown }>
    ),
  });

  const available =
    sellableStock(product.stock, product.sizes, product.sizeStocks) > 0;

  const title = cleanText(product.namePl);
  const description = cleanText(product.descriptionPl ?? "") || title;

  return {
    id: product.id,
    title,
    description: description.slice(0, DESCRIPTION_LIMIT),
    availability: available ? "in stock" : "out of stock",
    condition: "new",
    price: formatPrice(pricing.originalPricePln),
    sale_price: pricing.hasDiscount ? formatPrice(pricing.finalPricePln) : "",
    link: `${siteUrl}/shop/${product.category.slug}/${product.slug}`,
    image_link: imageUrls[0],
    additional_image_link: imageUrls.slice(1, 11).join(","),
    brand: FEED_LOCALE.brand,
    google_product_category: FEED_LOCALE.googleCategory,
  };
}

export function rowsToCsv(rows: FeedRow[]): string {
  const lines = [FEED_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(FEED_COLUMNS.map((column) => csvCell(row[column])).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}
