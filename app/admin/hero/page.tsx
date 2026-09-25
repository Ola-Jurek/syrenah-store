"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

type HeroImage = {
  id: string;
  imageUrl: string;
  mediaType: string;
  viewport: string;
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
  updatedAt: string;
} | null;

export default function AdminHeroPage() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "Odkryj",
    link: "/shop",
  });

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admin/hero", {
        headers: token ? { "x-admin-token": token } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setHeroSettings(data);
        if (data) {
          setFormData({
            title: data.titlePl || "",
            subtitle: data.subtitlePl || "",
            buttonText: data.buttonTextPl || "Odkryj",
            link: data.link || "/shop",
          });
        }
      } else if (res.status === 401) {
        alert("Brak autoryzacji. Zaloguj się ponownie.");
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    viewport: "mobile" | "desktop",
    mode: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (mode === "video" && !isVideo) {
      alert("W tym trybie wgraj film MP4 lub WebM.");
      e.target.value = "";
      return;
    }
    if (mode === "image" && isVideo) {
      alert("W tym trybie wgraj zdjęcie JPEG, PNG lub WebP.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("purpose", "hero");

      const token = getAdminToken();
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: token ? { "x-admin-token": token } : {},
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json().catch(() => null);
        throw new Error(error?.error || "Upload failed");
      }

      const { url } = await uploadRes.json();
      const mediaType = mode;

      const addRes = await fetch("/api/admin/hero/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify({ imageUrl: url, mediaType, viewport }),
      });

      if (addRes.ok) {
        await fetchHeroSettings();
      } else {
        if (addRes.status === 401) {
          alert("Brak autoryzacji. Zaloguj się ponownie.");
        } else {
          const error = await addRes.json();
          alert(error.error || "Błąd podczas dodawania zdjęcia");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Błąd podczas przesyłania pliku");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/hero/images/${imageId}`, {
        method: "DELETE",
        headers: token ? { "x-admin-token": token } : {},
      });

      if (res.ok) {
        await fetchHeroSettings();
      } else {
        if (res.status === 401) {
          alert("Brak autoryzacji. Zaloguj się ponownie.");
        } else {
          const error = await res.json();
          alert(error.error || "Błąd podczas usuwania zdjęcia");
        }
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Błąd podczas usuwania zdjęcia");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      const method = heroSettings ? "PATCH" : "POST";
      const url = heroSettings ? `/api/admin/hero/${heroSettings.id}` : "/api/admin/hero";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchHeroSettings();
        setEditing(false);
      } else {
        if (res.status === 401) {
          alert("Brak autoryzacji. Zaloguj się ponownie.");
        } else {
          const error = await res.json();
          alert(error.error || "Błąd podczas zapisywania");
        }
      }
    } catch (error) {
      console.error("Error saving hero settings:", error);
      alert("Błąd podczas zapisywania");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Ładowanie...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-black">Hero Section</h1>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-black text-white hover:bg-black/90"
          >
            {heroSettings ? "Edytuj teksty" : "Dodaj ustawienia"}
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Tytuł</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-black/20 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Podtytuł (opcjonalnie)
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="w-full border border-black/20 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tekst przycisku
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) =>
                setFormData({ ...formData, buttonText: e.target.value })
              }
              className="w-full border border-black/20 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full border border-black/20 px-4 py-2"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-black text-white hover:bg-black/90"
            >
              Zapisz
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                if (heroSettings) {
                  setFormData({
                    title: heroSettings.titlePl || "",
                    subtitle: heroSettings.subtitlePl || "",
                    buttonText: heroSettings.buttonTextPl || "Odkryj",
                    link: heroSettings.link || "/shop",
                  });
                }
              }}
            >
              Anuluj
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {heroSettings && (
            <div className="space-y-2">
              <p className="text-sm text-black/60">
                <strong>Tytuł:</strong> {heroSettings.titlePl}
              </p>
              {heroSettings.subtitlePl && (
                <p className="text-sm text-black/60">
                  <strong>Podtytuł:</strong> {heroSettings.subtitlePl}
                </p>
              )}
              <p className="text-sm text-black/60">
                <strong>Przycisk:</strong> {heroSettings.buttonTextPl} → {heroSettings.link}
              </p>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <HeroMediaSlot
              title="Telefon"
              hint="Pionowy kadr. Zdjęć może być kilka, film tylko jeden."
              viewport="mobile"
              aspect="aspect-[9/16]"
              images={(heroSettings?.images ?? []).filter(
                (image) => (image.viewport ?? "mobile") === "mobile"
              )}
              uploading={uploading}
              onUpload={handleUploadImage}
              onDelete={handleDeleteImage}
            />
            <HeroMediaSlot
              title="Desktop"
              hint="Poziomy kadr. Bez własnych plików strona pokaże zestaw z telefonu."
              viewport="desktop"
              aspect="aspect-[16/9]"
              images={(heroSettings?.images ?? []).filter(
                (image) => image.viewport === "desktop"
              )}
              uploading={uploading}
              onUpload={handleUploadImage}
              onDelete={handleDeleteImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function HeroMediaSlot({
  title,
  hint,
  viewport,
  aspect,
  images,
  uploading,
  onUpload,
  onDelete,
}: {
  title: string;
  hint: string;
  viewport: "mobile" | "desktop";
  aspect: string;
  images: HeroImage[];
  uploading: boolean;
  onUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    viewport: "mobile" | "desktop",
    mode: "image" | "video"
  ) => void;
  onDelete: (imageId: string) => void;
}) {
  const hasVideo = images.some((image) => image.mediaType === "video");
  const hasImages = images.some((image) => image.mediaType !== "video");
  const [mode, setMode] = useState<"image" | "video">(hasVideo ? "video" : "image");

  useEffect(() => {
    if (hasVideo) setMode("video");
    else if (hasImages) setMode("image");
  }, [hasVideo, hasImages]);

  const locked = hasVideo || hasImages;
  const videoFull = mode === "video" && hasVideo;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="mt-1 text-sm text-black/60">{hint}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={locked && mode !== "image"}
          onClick={() => setMode("image")}
          className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
            mode === "image"
              ? "border-black bg-black text-white"
              : "border-black/20 text-black/60"
          } disabled:opacity-40`}
        >
          Zdjęcia
        </button>
        <button
          type="button"
          disabled={locked && mode !== "video"}
          onClick={() => setMode("video")}
          className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
            mode === "video"
              ? "border-black bg-black text-white"
              : "border-black/20 text-black/60"
          } disabled:opacity-40`}
        >
          Film
        </button>
      </div>
      {locked && (
        <p className="text-xs text-black/45">
          Żeby zmienić typ, usuń najpierw obecne pliki.
        </p>
      )}
      {videoFull ? (
        <p className="text-sm text-black/50">
          Jest już film. Usuń go, żeby wgrać inny.
        </p>
      ) : (
        <input
          type="file"
          accept={
            mode === "video"
              ? "video/mp4,video/webm"
              : "image/jpeg,image/png,image/webp"
          }
          onChange={(e) => onUpload(e, viewport, mode)}
          disabled={uploading}
          className="block w-full text-sm text-black/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/90"
        />
      )}
      {uploading && <p className="text-sm text-black/60">Przesyłanie...</p>}
      {images.length === 0 ? (
        <p className="text-sm text-black/50">Brak plików.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id}>
              <div className={`${aspect} relative overflow-hidden rounded-lg bg-neutral-100`}>
                {image.mediaType === "video" ? (
                  <video
                    src={image.imageUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={image.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-black/40">
                  {image.mediaType === "video" ? "Film" : "Zdjęcie"}
                </p>
                <button
                  type="button"
                  onClick={() => onDelete(image.id)}
                  className="cursor-pointer text-xs uppercase tracking-wide text-red-700 hover:text-red-900"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
