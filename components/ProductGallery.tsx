"use client";

import { useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/locale";

type ImageType = {
  id: string;
  url: string;
  altPl: string | null;
  altEn: string | null;
  isPrimary: boolean;
};

type Props = {
  images: ImageType[];
  productName: string;
  locale?: Locale;
};

function pickAlt(img: ImageType, productName: string, locale: Locale) {
  if (locale === "en" && img.altEn?.trim()) return img.altEn;
  return img.altPl || productName;
}

export function ProductGallery({ images, productName, locale = "pl" }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const validImages = images.filter((img) => img.url?.trim());

  if (validImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-[#EDE3DF] rounded-xl flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Syrenah"
          width={120}
          height={120}
          className="opacity-20"
        />
      </div>
    );
  }

  const primaryImage = validImages.find((img) => img.isPrimary) || validImages[0];
  const displayImage = validImages[selectedIndex] || primaryImage;

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="aspect-[3/4] bg-[#EDE3DF] rounded-xl overflow-hidden mb-4 relative max-h-[80vh]">
        <Image
          src={displayImage.url}
          alt={pickAlt(displayImage, productName, locale)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {validImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-opacity ${
                selectedIndex === index
                  ? "border-black opacity-100"
                  : "border-black/20 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="relative w-full h-full bg-[#EDE3DF]">
                <Image
                  src={img.url}
                  alt={pickAlt(img, productName, locale)}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

