"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
};

type CategoriesResponse = {
  categories: Category[];
};

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

function promptAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.prompt("Wprowadź token admina:");
  if (token) {
    localStorage.setItem("adminToken", token);
    return token;
  }
  return null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      const promptedToken = promptAdminToken();
      if (!promptedToken) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }
    }
    setTokenChecked(true);
  }, []);

  useEffect(() => {
    if (!tokenChecked) return;

    async function fetchCategories() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/categories", {
          headers: {
            "x-admin-token": token,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          const newToken = promptAdminToken();
          if (newToken) {
            fetchCategories();
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Błąd pobierania kategorii");
        }

        const data: CategoriesResponse = await res.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd pobierania kategorii");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [tokenChecked]);

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-black/60 py-12">{error}</div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif">Kategorie</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Dodaj kategorię</Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center text-black/40 py-12">
          Brak kategorii. Dodaj pierwszą kategorię.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-black/10 rounded-lg p-6 hover:border-black/20 transition-colors"
            >
              <h2 className="text-lg font-medium mb-2">{category.namePl}</h2>
              <p className="text-sm text-black/60 mb-4">{category.nameEn}</p>
              <p className="text-xs text-black/40 mb-4">Slug: {category.slug}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    Edytuj
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

