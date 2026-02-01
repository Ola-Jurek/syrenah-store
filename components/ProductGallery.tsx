"use client";

import { useState } from "react";
import Image from "next/image";

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
};

export function ProductGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
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

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const displayImage = images[selectedIndex] || primaryImage;

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="aspect-[3/4] bg-[#EDE3DF] rounded-xl overflow-hidden mb-4 relative max-h-[80vh]">
        <Image
          src={displayImage.url}
          alt={displayImage.altPl || productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
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
                  alt={img.altPl || productName}
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

