"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WishlistButton } from "@/components/WishlistButton";
import { ProductBadge, useIsSoldOut } from "@/components/ProductBadge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageContext";
import { formatMoney } from "@/lib/format-price";

type Props = {
  product: {
    id: string;
    namePl: string;
    nameEn: string;
    slug: string;
    image?: string | null;
    imageAlt?: string | null;
    imageAltEn?: string | null;
    createdAt?: string | Date;
    stock?: number;
    originalPrice: string;
    finalPrice: string;
    originalPriceEur: string;
    finalPriceEur: string;
    discountLabelPl?: string | null;
    discountLabelEn?: string | null;
  };
  categorySlug: string;
};

export function ProductCard({ product, categorySlug }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSoldOut = useIsSoldOut(product.stock);
  const { locale } = useLanguage();

  const name =
    locale === "en" && product.nameEn?.trim()
      ? product.nameEn
      : product.namePl;

  const alt =
    locale === "en" && product.imageAltEn?.trim()
      ? product.imageAltEn
      : product.imageAlt || name;

  const originalPln = parseFloat(product.originalPrice);
  const finalPln = parseFloat(product.finalPrice);
  const originalEur = parseFloat(product.originalPriceEur);
  const finalEur = parseFloat(product.finalPriceEur);

  const original = locale === "en" ? originalEur : originalPln;
  const final = locale === "en" ? finalEur : finalPln;
  const hasPriceReduction = final < original;

  const discountLabel =
    locale === "en"
      ? product.discountLabelEn ?? product.discountLabelPl
      : product.discountLabelPl;

  return (
    <div className="group relative">
      <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <WishlistButton
          productId={product.id}
          size="sm"
          className="bg-white/60 backdrop-blur-sm shadow-sm"
        />
      </div>

      <ProductBadge
        createdAt={product.createdAt}
        stock={product.stock}
        hasPriceReduction={hasPriceReduction}
        discountLabel={discountLabel}
      />

      <Link href={`/shop/${categorySlug}/${product.slug}`}>
        <div
          className={cn(
            "bg-[#C1A88C]/10 aspect-[3/4] relative mb-3 overflow-hidden",
            isSoldOut && "after:absolute after:inset-0 after:bg-white/30 after:z-[1]"
          )}
        >
          {product.image && !imageLoaded && (
            <div className="absolute inset-0 bg-[#C1A88C]/10 animate-pulse z-[2]" />
          )}

          {product.image ? (
            <Image
              src={product.image}
              alt={alt}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                !isSoldOut && "group-hover:scale-105",
                isSoldOut && "grayscale opacity-70",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 768px) 50vw, 25vw"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Syrenah"
                width={80}
                height={80}
                className={cn("opacity-20", isSoldOut && "grayscale")}
              />
            </div>
          )}
        </div>
        <div className="text-center">
          <h2
            className={cn(
              "text-sm uppercase tracking-widest font-serif text-black mb-1",
              isSoldOut && "text-black/40"
            )}
          >
            {name.toUpperCase()}
          </h2>
          <div className="flex items-center justify-center gap-2">
            {hasPriceReduction && (
              <span
                className={cn(
                  "text-xs line-through text-black/40",
                  isSoldOut && "text-black/20"
                )}
              >
                {formatMoney(original, locale)}
              </span>
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                hasPriceReduction ? "text-[#C1A88C]" : "text-black/60",
                isSoldOut && "text-black/30"
              )}
            >
              {formatMoney(final, locale)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
