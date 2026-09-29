"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { AddToCartModal } from "./AddToCartModal";
import { cn } from "@/lib/utils";
import type { Messages } from "@/lib/dict";

type ProductI18n = Messages["product"];

type Props = {
  productId: string;
  name: string;
  namePl: string;
  nameEn: string;
  price: number;
  priceEur?: number;
  originalPricePln?: number;
  originalPriceEur?: number;
  stock?: number;
  sizeStocks?: Array<{ size: string; stock: number }>;
  sizes?: string[];
  colors?: string[];
  slug?: string;
  categorySlug?: string;
  i18n: ProductI18n;
};

export function AddToCartButton({
  productId,
  name,
  namePl,
  nameEn,
  price,
  priceEur,
  originalPricePln,
  originalPriceEur,
  stock = 1,
  sizeStocks = [],
  sizes = [],
  colors = [],
  slug,
  categorySlug,
  i18n,
}: Props) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);

  const hasSizes = sizes && sizes.length > 0;
  const hasColors = colors && colors.length > 0;
  const stockBySize = new Map(sizeStocks.map((row) => [row.size, row.stock]));
  const selectedSizeStock = hasSizes
    ? stockBySize.get(selectedSize) ?? 0
    : stock;
  const isOutOfStock = hasSizes ? stock <= 0 : stock === 0;
  const selectedUnavailable = hasSizes && !!selectedSize && selectedSizeStock <= 0;

  const handleClick = async () => {
    if (isOutOfStock || selectedUnavailable) return;

    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    setIsPressed(true);
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      productId,
      name: namePl || name,
      namePl,
      nameEn,
      price,
      priceEur,
      originalPrice: originalPricePln,
      originalPriceEur,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      slug,
      categorySlug,
    });

    setIsLoading(false);
    setIsPressed(false);
    setShowModal(true);
  };

  return (
    <>
      {hasSizes && (
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-black/60 mb-3 text-center md:text-left">
            {i18n.size}
          </label>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {sizes.map((size) => {
              const available = stockBySize.get(size) ?? 0;
              const soldOut = available <= 0;
              return (
              <button
                key={size}
                type="button"
                disabled={soldOut}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 text-xs uppercase tracking-widest transition-all",
                  soldOut
                    ? "opacity-40 cursor-not-allowed line-through border-black/20 text-black/40"
                    : selectedSize === size
                    ? "bg-[#C1A88C] text-white border-[#C1A88C]"
                    : "bg-transparent text-black border-[#C1A88C]/40 hover:border-[#C1A88C]"
                )}
              >
                {size}
              </button>
              );
            })}
          </div>
          {sizeError && (
            <p className="mt-2 text-xs text-[#C1A88C] text-center md:text-left">
              {i18n.selectSize}
            </p>
          )}
        </div>
      )}

      {hasColors && colors.length > 1 && (
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-black/60 mb-3 text-center md:text-left">
            {i18n.color}
          </label>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  selectedColor === color
                    ? "border-[#C1A88C] ring-2 ring-[#C1A88C]/20"
                    : "border-[#C1A88C]/40 hover:border-[#C1A88C]"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isOutOfStock || selectedUnavailable || isLoading}
        className={cn(
          "mt-auto w-full border py-4 text-sm tracking-wide uppercase transition-all duration-150",
          isOutOfStock || selectedUnavailable
            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
            : isLoading
              ? "opacity-75 cursor-wait border-[#C1A88C] bg-[#C1A88C]/10"
              : isPressed
                ? "scale-95 bg-[#C1A88C]/20 border-[#C1A88C]"
                : "bg-[#C1A88C] text-white border-[#C1A88C] hover:bg-[#C1A88C]/90 active:scale-95"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {i18n.adding}
          </span>
        ) : isOutOfStock || selectedUnavailable ? (
          i18n.outOfStock
        ) : (
          i18n.addToCart
        )}
      </button>

      <AddToCartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        i18n={i18n}
      />
    </>
  );
}
