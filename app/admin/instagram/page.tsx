"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

type InstagramPhoto = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

export default function AdminInstagramPage() {
  const [photos, setPhotos] = useState<InstagramPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admin/instagram", {
        headers: token ? { "x-admin-token": token } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos ?? []);
      } else if (res.status === 401) {
        alert("Brak autoryzacji. Zaloguj się ponownie.");
      }
    } catch (error) {
      console.error("Error fetching instagram photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const token = getAdminToken();

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: token ? { "x-admin-token": token } : {},
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await uploadRes.json();

        const addRes = await fetch("/api/admin/instagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "x-admin-token": token } : {}),
          },
          body: JSON.stringify({ imageUrl: url }),
        });

        if (!addRes.ok) {
          if (addRes.status === 401) {
            alert("Brak autoryzacji. Zaloguj się ponownie.");
            return;
          }
          const error = await addRes.json();
          throw new Error(error.error || "Błąd podczas dodawania zdjęcia");
        }
      }

      await fetchPhotos();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        error instanceof Error ? error.message : "Błąd podczas przesyłania zdjęcia"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zdjęcie?")) return;

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/instagram/${id}`, {
        method: "DELETE",
        headers: token ? { "x-admin-token": token } : {},
      });

      if (res.ok) {
        setPhotos((current) => current.filter((photo) => photo.id !== id));
      } else if (res.status === 401) {
        alert("Brak autoryzacji. Zaloguj się ponownie.");
      } else {
        const error = await res.json();
        alert(error.error || "Błąd podczas usuwania zdjęcia");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Błąd podczas usuwania zdjęcia");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-black/40">Ładowanie...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1 text-xs font-medium uppercase tracking-widest text-black">
          Instagram
        </h1>
        <p className="text-xs text-black/40">
          Zdjęcia pojawią się w kafelkach na stronie głównej. Puste miejsca zostaną z logo.
        </p>
      </div>

      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-black/70">
          Dodaj zdjęcia
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full max-w-md text-sm text-black/60 file:mr-4 file:border-0 file:bg-[#C1A88C] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-widest file:text-white hover:file:bg-[#B09A7C]"
        />
        {uploading && (
          <p className="mt-2 text-sm text-black/50">Przesyłanie...</p>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-black/40">
          Brak zdjęć. Dodaj pierwsze powyżej.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="relative aspect-square overflow-hidden bg-[#EDE3DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="mt-2 w-full rounded-none border border-[#E8E3D8] bg-transparent text-xs uppercase tracking-widest text-neutral-600 hover:bg-[#FDFBF7]"
                variant="outline"
                size="sm"
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
