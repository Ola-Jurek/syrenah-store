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

  const safeIndex = selectedIndex >= 0 && selectedIndex < validImages.length ? selectedIndex : 0;
  const displayImage = validImages[safeIndex];
  const hasMany = validImages.length > 1;

  const goTo = (index: number) => {
    const count = validImages.length;
    setSelectedIndex(((index % count) + count) % count);
  };

  return (
    <div className="w-full min-w-0">
      <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#EDE3DF] md:max-h-[calc(100svh-11rem)]">
        <Image
          key={displayImage.url}
          src={displayImage.url}
          alt={pickAlt(displayImage, productName, locale)}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {hasMany && (
          <>
            <button
              type="button"
              aria-label={locale === "en" ? "Previous image" : "Poprzednie zdjęcie"}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
              onClick={() => goTo(safeIndex - 1)}
            />
            <button
              type="button"
              aria-label={locale === "en" ? "Next image" : "Następne zdjęcie"}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
              onClick={() => goTo(safeIndex + 1)}
            />
          </>
        )}
      </div>

      {hasMany && (
        <div className="relative z-20 flex w-full min-w-0 gap-2 overflow-x-auto">
          {validImages.map((img, index) => (
            <button
              key={img.id || img.url}
              type="button"
              aria-label={
                locale === "en"
                  ? `Show image ${index + 1}`
                  : `Pokaż zdjęcie ${index + 1}`
              }
              aria-current={safeIndex === index ? "true" : undefined}
              onClick={() => goTo(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-opacity ${
                safeIndex === index
                  ? "border-black opacity-100"
                  : "border-black/20 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={pickAlt(img, productName, locale)}
                fill
                className="object-cover pointer-events-none"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

