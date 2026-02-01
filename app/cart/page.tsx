"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type ProductImage = {
  productId: string;
  imageUrl: string | null;
};

export default function CartPage() {
  const { items, removeFromCart } = useCart();
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});

  // Pobierz zdjęcia produktów
  useEffect(() => {
    async function fetchImages() {
      const productIds = items.map(item => item.productId);
      if (productIds.length === 0) return;

      try {
        const res = await fetch(`/api/products/images?ids=${productIds.join(',')}`);
        if (res.ok) {
          const data: ProductImage[] = await res.json();
          const imagesMap: Record<string, string | null> = {};
          data.forEach(item => {
            imagesMap[item.productId] = item.imageUrl;
          });
          setProductImages(imagesMap);
        }
      } catch (error) {
        console.error("Error fetching product images:", error);
      }
    }

    fetchImages();
  }, [items]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getProductLink = (item: typeof items[0]) => {
    if (item.slug && item.categorySlug) {
      return `/shop/${item.categorySlug}/${item.slug}`;
    }
    return "#";
  };

  return (
    <div className="px-6 pt-24 pb-16 max-w-4xl mx-auto bg-white">
      <h1 className="text-xs uppercase tracking-widest mb-12 text-black font-medium">
        KOSZYK
      </h1>

      {items.length === 0 ? (
        <p className="text-black/60 text-center py-12">Twój koszyk jest pusty.</p>
      ) : (
        <>
          <ul className="space-y-6 mb-12">
            {items.map((item) => {
              const productLink = getProductLink(item);
              const imageUrl = productImages[item.productId];

              return (
                <li
                  key={`${item.productId}-${item.size || ''}-${item.color || ''}`}
                  className="border-b border-black/10 pb-6 flex gap-4"
                >
                  {/* Zdjęcie produktu - klikalne */}
                  {productLink !== "#" ? (
                    <Link href={productLink} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-[#C1A88C]/10 relative overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#C1A88C]/20 rounded" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-24 h-24 bg-[#C1A88C]/10 flex-shrink-0" />
                  )}

                  {/* Informacje o produkcie */}
                  <div className="flex-1">
                    {productLink !== "#" ? (
                      <Link href={productLink}>
                        <p className="font-serif text-sm mb-1 hover:text-[#C1A88C] transition-colors">
                          {item.name}
                        </p>
                      </Link>
                    ) : (
                      <p className="font-serif text-sm mb-1">{item.name}</p>
                    )}
                    
                    {item.size && (
                      <p className="text-xs text-black/60 mb-1">
                        Rozmiar: {item.size}
                      </p>
                    )}
                    {item.color && (
                      <p className="text-xs text-black/60 mb-1">
                        Kolor: {item.color}
                      </p>
                    )}
                    
                    <p className="text-xs text-black/60 mb-3">
                      {item.price} PLN × {item.quantity}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      Usuń
                    </button>
                  </div>

                  {/* Cena */}
                  <div className="text-right">
                    <p className="font-serif text-sm">
                      {(item.price * item.quantity).toFixed(2)} PLN
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Podsumowanie - beżowe tło */}
          <div className="bg-[#C1A88C]/10 p-6 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="uppercase tracking-widest text-black/60">Suma</span>
              <span className="font-serif text-lg text-black">
                {total.toFixed(2)} PLN
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex justify-center">
              <Link href="/checkout">
                <button
                  className="
                    bg-[#C1A88C] text-white
                    px-10 py-4
                    text-xs uppercase tracking-widest
                    hover:bg-[#C1A88C]/90
                    transition-colors
                  "
                >
                  Przejdź do podsumowania
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}


