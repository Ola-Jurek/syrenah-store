"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function splitSizeLabels(text: string): string[] {
  return text
    .split(",")
    .map((size) => size.trim())
    .filter((size) => size.length > 0);
}

export function sizeStocksPayload(
  sizesText: string,
  values: Record<string, string>
): Array<{ size: string; stock: number }> {
  return splitSizeLabels(sizesText).map((size) => {
    const parsed = parseInt(values[size] ?? "0", 10);
    return { size, stock: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 };
  });
}

type Props = {
  sizesText: string;
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
};

export function SizeStockFields({ sizesText, values, onChange }: Props) {
  const sizes = splitSizeLabels(sizesText);
  if (sizes.length === 0) return null;

  return (
    <div>
      <p className="text-sm text-black/70 mb-2">Stan magazynowy według rozmiaru</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sizes.map((size) => (
          <div key={size}>
            <Label htmlFor={`size-stock-${size}`} className="text-black/70">
              {size}
            </Label>
            <Input
              id={`size-stock-${size}`}
              type="number"
              min={0}
              value={values[size] ?? "0"}
              onChange={(e) =>
                onChange({ ...values, [size]: e.target.value })
              }
              className="mt-1 border-black/20"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-black/40 mt-2">
        Każdy rozmiar ma własną liczbę sztuk. Puste pole liczy się jako 0.
      </p>
    </div>
  );
}
