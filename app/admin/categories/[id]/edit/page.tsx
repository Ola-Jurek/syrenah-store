"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAdminToken,
  ensureAdminToken,
  recoverAdminToken,
} from "@/lib/adminToken";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);

  const [formData, setFormData] = useState({
    namePl: "",
    nameEn: "",
    descriptionPl: "",
    descriptionEn: "",
    slug: "",
  });

  useEffect(() => {
    async function fetchCategory() {
      let token = ensureAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        let res = await fetch(`/api/admin/categories/${id}`, {
          headers: { "x-admin-token": token },
        });

        if (res.status === 401) {
          token = recoverAdminToken();
          if (!token) {
            setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
            setLoading(false);
            return;
          }
          res = await fetch(`/api/admin/categories/${id}`, {
            headers: { "x-admin-token": token },
          });
        }

        if (res.status === 401) {
          clearAdminToken();
          setError("Nieautoryzowany dostęp");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Nie znaleziono kategorii");
        }

        const data = await res.json();
        const c = data.category;
        setFormData({
          namePl: c.namePl || "",
          nameEn: c.nameEn || "",
          descriptionPl: c.descriptionPl || "",
          descriptionEn: c.descriptionEn || "",
          slug: c.slug || "",
        });
        setProductCount(c.productCount ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd pobierania");
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [id]);

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
      let res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
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
        token = recoverAdminToken();
        if (!token) {
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          setSaving(false);
          return;
        }
        res = await fetch(`/api/admin/categories/${id}`, {
          method: "PATCH",
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
      }

      if (res.status === 401) {
        clearAdminToken();
        setError("Nieautoryzowany dostęp");
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd aktualizacji kategorii");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Błąd aktualizacji kategorii"
      );
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (productCount > 0) {
      setError(
        `Nie można usunąć — kategoria ma ${productCount} produkt(ów). Przenieś je najpierw.`
      );
      return;
    }

    if (!window.confirm("Na pewno usunąć tę kategorię?")) return;

    setDeleting(true);
    setError(null);

    const token = ensureAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setDeleting(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd usuwania kategorii");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd usuwania kategorii");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif">Edytuj kategorię</h1>
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
            {productCount > 0 && (
              <p className="text-xs text-black/50 mt-1">
                Produktów w kategorii: {productCount}
              </p>
            )}
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
                onChange={(e) =>
                  setFormData({ ...formData, namePl: e.target.value })
                }
                className="mt-1 border-black/20"
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
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="mt-1 border-black/20"
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

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving || deleting}>
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/categories">Anuluj</Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={saving || deleting || productCount > 0}
            onClick={handleDelete}
            className="border-red-200 text-red-600 hover:bg-red-50"
            title={
              productCount > 0
                ? "Najpierw przenieś produkty z tej kategorii"
                : "Usuń kategorię"
            }
          >
            {deleting ? "Usuwanie..." : "Usuń kategorię"}
          </Button>
        </div>
      </form>
    </>
  );
}
