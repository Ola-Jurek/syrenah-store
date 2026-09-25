"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAdminToken,
  ensureAdminToken,
} from "@/lib/adminToken";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState({
    namePl: "",
    nameEn: "",
    descriptionPl: "",
    descriptionEn: "",
    slug: "",
  });

  const handleNamePlChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      namePl: value,
      slug: slugTouched ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let token = ensureAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namePl: formData.namePl.trim(),
          nameEn: formData.nameEn.trim() || formData.namePl.trim(),
          descriptionPl: formData.descriptionPl.trim() || null,
          descriptionEn: formData.descriptionEn.trim() || null,
          slug: formData.slug.trim(),
        }),
      });

      if (res.status === 401) {
        clearAdminToken();
        setError("Nieautoryzowany dostęp");
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd tworzenia kategorii");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd tworzenia kategorii");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif">Nowa kategoria</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">← Wróć</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <Card className="mb-6 border-black/10 bg-white">
          <CardHeader>
            <CardTitle className="text-black">Dane kategorii</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="namePl" className="text-black/70">
                Nazwa PL *
              </Label>
              <Input
                id="namePl"
                required
                value={formData.namePl}
                onChange={(e) => handleNamePlChange(e.target.value)}
                className="mt-1 border-black/20"
                placeholder="np. Sukienki"
              />
            </div>

            <div>
              <Label htmlFor="nameEn" className="text-black/70">
                Nazwa EN
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                className="mt-1 border-black/20"
                placeholder="np. Dresses"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-black/70">
                Slug *
              </Label>
              <Input
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                className="mt-1 border-black/20"
                placeholder="sukienki"
              />
              <p className="text-xs text-black/40 mt-1">
                Adres w sklepie: /shop/{formData.slug || "slug"}
              </p>
            </div>

            <div>
              <Label htmlFor="descriptionPl" className="text-black/70">
                Opis PL
              </Label>
              <textarea
                id="descriptionPl"
                value={formData.descriptionPl}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionPl: e.target.value })
                }
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>

            <div>
              <Label htmlFor="descriptionEn" className="text-black/70">
                Opis EN
              </Label>
              <textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Zapisywanie..." : "Utwórz kategorię"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/categories">Anuluj</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
