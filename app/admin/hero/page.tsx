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
  order: number;
};

type HeroSettings = {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string;
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
            title: data.title || "",
            subtitle: data.subtitle || "",
            buttonText: data.buttonText || "Odkryj",
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

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase
      const formData = new FormData();
      formData.append("file", file);

      const token = getAdminToken();
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: token ? { "x-admin-token": token } : {},
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await uploadRes.json();

      // Add image to hero
      const addRes = await fetch("/api/admin/hero/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify({ imageUrl: url }),
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
      alert("Błąd podczas przesyłania zdjęcia");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zdjęcie?")) return;

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
                    title: heroSettings.title || "",
                    subtitle: heroSettings.subtitle || "",
                    buttonText: heroSettings.buttonText || "Odkryj",
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
                <strong>Tytuł:</strong> {heroSettings.title}
              </p>
              {heroSettings.subtitle && (
                <p className="text-sm text-black/60">
                  <strong>Podtytuł:</strong> {heroSettings.subtitle}
                </p>
              )}
              <p className="text-sm text-black/60">
                <strong>Przycisk:</strong> {heroSettings.buttonText} → {heroSettings.link}
              </p>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dodaj zdjęcie
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={uploading}
              className="block w-full text-sm text-black/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/90"
            />
            {uploading && <p className="text-sm text-black/60 mt-2">Przesyłanie...</p>}
          </div>

          {/* Images List */}
          {heroSettings && heroSettings.images.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Zdjęcia ({heroSettings.images.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {heroSettings.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-[16/9] bg-neutral-100 relative overflow-hidden rounded-lg">
                      <Image
                        src={image.imageUrl}
                        alt={`Hero image ${image.order}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <Button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      Usuń
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!heroSettings || heroSettings.images.length === 0) && (
            <p className="text-black/60">Brak zdjęć. Dodaj pierwsze zdjęcie powyżej.</p>
          )}
        </div>
      )}
    </div>
  );
}
