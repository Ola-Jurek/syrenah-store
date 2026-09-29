"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clearAdminToken,
  ensureAdminToken,
  recoverAdminToken,
} from "@/lib/adminToken";

type InstagramPhoto = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

export default function AdminInstagramPage() {
  const [photos, setPhotos] = useState<InstagramPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    const token = ensureAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/instagram", {
        headers: { "x-admin-token": token },
      });

      if (res.status === 401) {
        clearAdminToken();
        const newToken = recoverAdminToken();
        if (newToken) {
          await fetchPhotos();
          return;
        }
        setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos ?? []);
        setError(null);
      } else {
        setError("Błąd pobierania zdjęć");
      }
    } catch (err) {
      console.error("Error fetching instagram photos:", err);
      setError("Błąd pobierania zdjęć");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFiles = async (files: File[], token: string) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: formData,
      });

      if (uploadRes.status === 401) return "unauthorized" as const;
      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url } = await uploadRes.json();

      const addRes = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (addRes.status === 401) return "unauthorized" as const;
      if (!addRes.ok) {
        const errBody = await addRes.json();
        throw new Error(errBody.error || "Błąd podczas dodawania zdjęcia");
      }
    }
    return "ok" as const;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    let token = ensureAdminToken();
    if (!token) {
      alert("Brak tokena admina");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      let result = await uploadFiles(files, token);
      if (result === "unauthorized") {
        token = recoverAdminToken();
        if (!token) {
          alert("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          return;
        }
        result = await uploadFiles(files, token);
        if (result === "unauthorized") {
          alert("Nieautoryzowany dostęp. Sprawdź token admina.");
          return;
        }
      }
      await fetchPhotos();
    } catch (err) {
      console.error("Error uploading image:", err);
      alert(
        err instanceof Error ? err.message : "Błąd podczas przesyłania zdjęcia"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deletePhoto = async (id: string, token: string) => {
    const res = await fetch(`/api/admin/instagram/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    return res;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zdjęcie?")) return;

    let token = ensureAdminToken();
    if (!token) {
      alert("Brak tokena admina");
      return;
    }

    try {
      let res = await deletePhoto(id, token);
      if (res.status === 401) {
        token = recoverAdminToken();
        if (!token) {
          alert("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          return;
        }
        res = await deletePhoto(id, token);
      }

      if (res.ok) {
        setPhotos((current) => current.filter((photo) => photo.id !== id));
      } else if (res.status === 401) {
        alert("Nieautoryzowany dostęp. Sprawdź token admina.");
      } else {
        const errBody = await res.json();
        alert(errBody.error || "Błąd podczas usuwania zdjęcia");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Błąd podczas usuwania zdjęcia");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-black/40">Ładowanie...</div>;
  }

  if (error && photos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <Button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchPhotos();
          }}
          className="rounded-none bg-[#C1A88C] text-xs uppercase tracking-widest text-white hover:bg-[#B09A7C]"
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
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
