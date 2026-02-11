"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroImage = {
  id: string;
  imageUrl: string;
  order: number;
};

type HeroSettings = {
  id: string;
  titlePl: string;
  titleEn: string | null;
  subtitlePl: string | null;
  subtitleEn: string | null;
  buttonTextPl: string;
  buttonTextEn: string | null;
  link: string;
  images: HeroImage[];
} | null;

type Props = {
  heroSettings: HeroSettings;
};

export function HeroSection({ heroSettings }: Props) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (!heroSettings || heroSettings.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSettings.images.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [heroSettings]);

  if (!heroSettings || heroSettings.images.length === 0) {
    return (
      <section className="relative w-full h-[calc(100svh-64px)] md:h-[calc(100vh-64px)] bg-[#EDE3DF] overflow-hidden">
        {/* Background Logo - fills entire div */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/logo.png"
            alt="Syrenah"
            fill
            className="object-contain opacity-20"
            sizes="100vw"
          />
        </div>

        {/* Content - Always visible, centered */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div
            className={`transition-all duration-[1200ms] ease-out ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair italic text-black/90 mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              {heroSettings?.titlePl || ""}
            </h1>
            {heroSettings?.subtitlePl && (
              <p className="text-lg md:text-xl text-black/80 mb-8 font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                {heroSettings.subtitlePl}
              </p>
            )}
            {heroSettings && (
              <Link
                href={heroSettings.link}
                className="inline-block border border-black/30 bg-black/5 backdrop-blur-sm px-8 py-3 text-sm uppercase tracking-widest text-black/80 hover:bg-black hover:text-white transition-all duration-300"
              >
                {heroSettings.buttonTextPl}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const images = heroSettings.images;
  const hasMultipleImages = images.length > 1;

  return (
    <section className="relative w-full h-[calc(100svh-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
      {/* Background Images with Cross-fade */}
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
        >
          <div
            className={`relative w-full h-full ${
              hasMultipleImages ? "animate-ken-burns" : ""
            }`}
          >
            <Image
              src={image.imageUrl}
              alt={`${heroSettings.titlePl} - ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VERTNERiIvPjwvc3ZnPg=="
            />
          </div>
        </div>
      ))}

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10" />

      {/* Content - Always visible, centered */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
        <div
          className={`transition-all duration-[1200ms] ease-out ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair italic text-white mb-4 drop-shadow-lg">
            {heroSettings.titlePl}
          </h1>
          {heroSettings.subtitlePl && (
            <p className="text-lg md:text-xl text-white/90 mb-8 font-serif drop-shadow-md">
              {heroSettings.subtitlePl}
            </p>
          )}
          <Link
            href={heroSettings.link}
            className="inline-block border border-white/80 bg-white/10 backdrop-blur-sm px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            {heroSettings.buttonTextPl}
          </Link>
        </div>
      </div>
    </section>
  );
}
