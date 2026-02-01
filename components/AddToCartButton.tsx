"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { AddToCartModal } from "./AddToCartModal";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  name: string;
  price: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  slug?: string;
  categorySlug?: string;
};

export function AddToCartButton({ 
  productId, 
  name, 
  price, 
  stock = 1,
  sizes = [],
  colors = [],
  slug,
  categorySlug,
}: Props) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);
  
  const isOutOfStock = stock === 0;
  const hasSizes = sizes && sizes.length > 0;
  const hasColors = colors && colors.length > 0;

  const handleClick = async () => {
    if (isOutOfStock) return;

    // Walidacja rozmiaru
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    setIsPressed(true);
    setIsLoading(true);

    // Symulacja krótkiego opóźnienia dla lepszego UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({ 
      productId, 
      name, 
      price,
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
        {/* Wybór rozmiaru */}
        {hasSizes && (
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-black/60 mb-3 text-center md:text-left">
              Rozmiar
            </label>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 text-xs uppercase tracking-widest transition-all",
                    selectedSize === size
                      ? "bg-[#C1A88C] text-white border-[#C1A88C]"
                      : "bg-transparent text-black border-[#C1A88C]/40 hover:border-[#C1A88C]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="mt-2 text-xs text-[#C1A88C] text-center md:text-left">
                Wybierz rozmiar
              </p>
            )}
          </div>
        )}

        {/* Wybór koloru */}
        {hasColors && colors.length > 1 && (
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-black/60 mb-3 text-center md:text-left">
              Kolor
            </label>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {colors.map((color) => (
                <button
                  key={color}
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
          onClick={handleClick}
          disabled={isOutOfStock || isLoading}
          className={cn(
            "mt-auto w-full border py-4 text-sm tracking-wide uppercase transition-all duration-150",
            isOutOfStock
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
              Dodawanie...
            </span>
          ) : isOutOfStock ? (
            "Produkt niedostępny"
          ) : (
            "Dodaj do koszyka"
          )}
        </button>

        <AddToCartModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }
  
