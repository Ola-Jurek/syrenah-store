"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";

export const INSTAGRAM_URL = "https://www.instagram.com/syrenah_the_label/";

type InstagramPhoto = {
  id: string;
  imageUrl: string;
};

const FALLBACK_COUNT = 4;

function PlaceholderTile({ ariaLabel }: { ariaLabel: string }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group aspect-square bg-[#EDE3DF] relative overflow-hidden flex items-center justify-center"
      aria-label={ariaLabel}
    >
      <Image
        src="/logo.png"
        alt=""
        width={72}
        height={72}
        className="opacity-20 transition-opacity group-hover:opacity-30"
      />
    </a>
  );
}

function PhotoTile({
  photo,
  ariaLabel,
}: {
  photo: InstagramPhoto;
  ariaLabel: string;
}) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group aspect-square bg-[#EDE3DF] relative overflow-hidden block"
      aria-label={ariaLabel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </a>
  );
}

export function InstagramFeed() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<InstagramPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/instagram/photos");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      } catch {
        // fallback: placeholdery
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const placeholderCount = Math.max(0, FALLBACK_COUNT - photos.length);

  return (
    <section className="bg-[#FAF9F6] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-10 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_release_your_inner_siren.svg?v=4"
            alt={t("instagram.title")}
            className="h-auto w-full max-w-[200px]"
          />
        </h2>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {loading &&
            Array.from({ length: FALLBACK_COUNT }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="aspect-square bg-[#EDE3DF] animate-pulse"
              />
            ))}

          {!loading &&
            photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                ariaLabel={t("instagram.openPost")}
              />
            ))}

          {!loading &&
            Array.from({ length: placeholderCount }).map((_, i) => (
              <PlaceholderTile
                key={`ph-${i}`}
                ariaLabel={t("instagram.openProfile")}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
