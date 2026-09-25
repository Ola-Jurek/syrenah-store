import { Prisma } from "@prisma/client";

export type SizeStock = {
  size: string;
  stock: number;
};

export function parseSizeLabels(raw: unknown): string[] {
  if (!raw) return [];
  const value = typeof raw === "string" ? safeJson(raw) : raw;
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function alignSizeStocks(
  sizes: string[],
  rows: Array<{ size: string; stock: number }>
): SizeStock[] {
  return sizes.map((size) => {
    const row = rows.find((item) => item.size === size);
    return { size, stock: Math.max(0, row?.stock ?? 0) };
  });
}

/** Suma sztuk do sprzedaży. Przy rozmiarach liczy tylko zapisane stany rozmiarów. */
export function sellableStock(
  productStock: number,
  sizesRaw: unknown,
  rows: Array<{ size: string; stock: number }>
): number {
  const sizes = parseSizeLabels(sizesRaw);
  if (sizes.length === 0) return Math.max(0, productStock);
  return alignSizeStocks(sizes, rows).reduce((sum, row) => sum + row.stock, 0);
}

export function stockForSize(
  productStock: number,
  sizesRaw: unknown,
  rows: Array<{ size: string; stock: number }>,
  size: string | null | undefined
): { available: number; error?: string } {
  const sizes = parseSizeLabels(sizesRaw);
  if (sizes.length === 0) {
    return { available: Math.max(0, productStock) };
  }
  const selected = size?.trim() ?? "";
  if (!selected || !sizes.includes(selected)) {
    return { available: 0, error: "Wybierz rozmiar" };
  }
  const row = rows.find((item) => item.size === selected);
  return { available: Math.max(0, row?.stock ?? 0) };
}

export function parseSizeStockInput(
  sizes: string[],
  input: unknown
): SizeStock[] {
  const rows = Array.isArray(input) ? input : [];
  return sizes.map((size) => {
    const match = rows.find(
      (row) =>
        row &&
        typeof row === "object" &&
        "size" in row &&
        (row as { size?: unknown }).size === size
    ) as { stock?: unknown } | undefined;
    const parsed = Number(match?.stock ?? 0);
    const stock = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    return { size, stock };
  });
}

/** Zapisuje stany rozmiarów i zwraca ich sumę. Przy braku rozmiarów kasuje wiersze i zwraca null. */
export async function syncProductSizeStocks(
  tx: Prisma.TransactionClient,
  productId: string,
  sizes: string[],
  input: unknown
): Promise<number | null> {
  await tx.productSizeStock.deleteMany({ where: { productId } });
  if (sizes.length === 0) return null;
  const rows = parseSizeStockInput(sizes, input);
  if (rows.length > 0) {
    await tx.productSizeStock.createMany({
      data: rows.map((row) => ({
        productId,
        size: row.size,
        stock: row.stock,
      })),
    });
  }
  return rows.reduce((sum, row) => sum + row.stock, 0);
}
