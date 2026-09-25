"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAdminToken,
  getAdminToken,
  promptAdminToken,
} from "@/lib/adminToken";

type Category = {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
};

type ActiveDiscount = {
  id: string;
  code: string;
  namePl: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
};

type Product = {
  id: string;
  namePl: string;
  nameEn: string;
  pricePln: number;
  salePricePln: number | null;
  stock: number;
  category: Category;
  primaryImage: { url: string } | null;
  activeDiscount: ActiveDiscount | null;
};

type ProductsResponse = {
  products: Product[];
};

type CategoriesResponse = {
  categories: Category[];
};

type StockFilter = "all" | "out" | "low" | "in";
type SortOption = "newest" | "stock-asc" | "stock-desc" | "name";

const LOW_STOCK_THRESHOLD = 5;

function stockClass(stock: number): string {
  if (stock <= 0) return "text-red-600 font-medium";
  if (stock <= LOW_STOCK_THRESHOLD) return "text-amber-600 font-medium";
  return "text-black/80";
}

function getDiscountLabel(product: Product): string | null {
  if (product.activeDiscount) {
    const d = product.activeDiscount;
    const name = d.namePl ? `${d.namePl} ` : "";
    return d.type === "PERCENTAGE"
      ? `${name}-${d.value}%`
      : `${name}-${d.value.toFixed(0)} zł`;
  }
  if (product.salePricePln && product.pricePln > 0) {
    const diff = product.pricePln - product.salePricePln;
    const pct = Math.round((diff / product.pricePln) * 100);
    return `-${pct}% (${product.salePricePln.toFixed(2)} zł)`;
  }
  return null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");

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

    async function fetchData() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/products", {
            headers: { "x-admin-token": token },
          }),
          fetch("/api/admin/categories", {
            headers: { "x-admin-token": token },
          }),
        ]);

        if (productsRes.status === 401 || categoriesRes.status === 401) {
          clearAdminToken();
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          const newToken = promptAdminToken();
          if (newToken) {
            fetchData();
          }
          return;
        }

        if (!productsRes.ok) {
          throw new Error("Błąd pobierania produktów");
        }

        const productsData: ProductsResponse = await productsRes.json();
        setProducts(productsData.products);

        if (categoriesRes.ok) {
          const categoriesData: CategoriesResponse = await categoriesRes.json();
          setCategories(categoriesData.categories);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Błąd pobierania produktów"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tokenChecked]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category.id === categoryFilter);
    }

    if (stockFilter === "out") {
      list = list.filter((p) => p.stock <= 0);
    } else if (stockFilter === "low") {
      list = list.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
    } else if (stockFilter === "in") {
      list = list.filter((p) => p.stock > 0);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.namePl.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.category.namePl.toLowerCase().includes(q)
      );
    }

    if (sortBy === "stock-asc") {
      list.sort((a, b) => a.stock - b.stock || a.namePl.localeCompare(b.namePl));
    } else if (sortBy === "stock-desc") {
      list.sort((a, b) => b.stock - a.stock || a.namePl.localeCompare(b.namePl));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.namePl.localeCompare(b.namePl, "pl"));
    }
    // "newest" — kolejność z API (createdAt desc)

    return list;
  }, [products, categoryFilter, stockFilter, sortBy, search]);

  const stockCounts = useMemo(() => {
    const inCategory =
      categoryFilter === "all"
        ? products
        : products.filter((p) => p.category.id === categoryFilter);
    return {
      out: inCategory.filter((p) => p.stock <= 0).length,
      low: inCategory.filter(
        (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
      ).length,
    };
  }, [products, categoryFilter]);

  const hasActiveFilters =
    categoryFilter !== "all" ||
    stockFilter !== "all" ||
    sortBy !== "newest" ||
    search.trim() !== "";

  const resetFilters = () => {
    setCategoryFilter("all");
    setStockFilter("all");
    setSortBy("newest");
    setSearch("");
  };

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

  const selectClass =
    "px-3 py-2 text-sm border border-black/15 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black/20";

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-medium text-black">Produkty</h1>
        <Button asChild className="bg-black text-white hover:bg-black/90">
          <Link href="/admin/products/new">Nowy produkt</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-black/40 mb-1">
              Szukaj
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nazwa produktu..."
              className={`${selectClass} w-full`}
            />
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-black/40 mb-1">
              Kategoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${selectClass} w-full`}
            >
              <option value="all">Wszystkie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.namePl}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-black/40 mb-1">
              Stan magazynowy
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className={`${selectClass} w-full`}
            >
              <option value="all">Wszystkie</option>
              <option value="out">Brak (0)</option>
              <option value="low">Niski (1–{LOW_STOCK_THRESHOLD})</option>
              <option value="in">Dostępne (&gt;0)</option>
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-black/40 mb-1">
              Sortuj
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`${selectClass} w-full`}
            >
              <option value="newest">Najnowsze</option>
              <option value="stock-asc">Stock: od najmniejszego</option>
              <option value="stock-desc">Stock: od największego</option>
              <option value="name">Nazwa A–Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="border-black/20 text-black/60"
            >
              Wyczyść
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-black/50">
          <span>
            Pokazano{" "}
            <span className="text-black/80 font-medium">
              {filteredProducts.length}
            </span>{" "}
            z {products.length}
          </span>
          {stockCounts.out > 0 && (
            <span className="text-red-600">
              Brak na stanie: {stockCounts.out}
            </span>
          )}
          {stockCounts.low > 0 && (
            <span className="text-amber-600">
              Niski stock: {stockCounts.low}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Nazwa PL
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Kategoria
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Cena PLN
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Promocja
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Stock
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-black/40">
                  Brak produktów spełniających filtry
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const discountLabel = getDiscountLabel(product);
                const hasPromo = !!discountLabel;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-black/80">
                      {product.namePl}
                    </td>
                    <td className="py-4 px-4 text-sm text-black/60">
                      {product.category.namePl}
                    </td>
                    <td className="py-4 px-4 text-sm text-right text-black/80">
                      {product.pricePln.toFixed(2)} zł
                    </td>
                    <td className="py-4 px-4 text-center">
                      {hasPromo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D4A0A0]/15 text-[#D4A0A0] border border-[#D4A0A0]/25">
                          <Percent className="w-3 h-3" />
                          {discountLabel}
                        </span>
                      ) : (
                        <span className="text-black/20 text-xs">—</span>
                      )}
                    </td>
                    <td
                      className={`py-4 px-4 text-sm text-right ${stockClass(product.stock)}`}
                    >
                      {product.stock}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-black/20 text-black/70 hover:bg-black/5"
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          Edytuj
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-black/40 py-12">
            Brak produktów spełniających filtry
          </div>
        ) : (
          filteredProducts.map((product) => {
            const discountLabel = getDiscountLabel(product);
            const hasPromo = !!discountLabel;

            return (
              <Card key={product.id} className="border-black/10 bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 text-black">
                        {product.namePl}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-black/50">
                          {product.category.namePl}
                        </p>
                        {hasPromo && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#D4A0A0]/15 text-[#D4A0A0] border border-[#D4A0A0]/25">
                            <Percent className="w-2.5 h-2.5" />
                            {discountLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    {product.primaryImage?.url && (
                      <img
                        src={product.primaryImage.url}
                        alt={product.namePl}
                        className="w-16 h-16 object-cover rounded border border-black/10"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-black/50">Cena PLN</p>
                      <p className="text-base font-medium text-black">
                        {product.pricePln.toFixed(2)} zł
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black/50">Stock</p>
                      <p
                        className={`text-base font-medium ${stockClass(product.stock)}`}
                      >
                        {product.stock}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-black/20 text-black/70 hover:bg-black/5"
                  >
                    <Link href={`/admin/products/${product.id}`}>Edytuj</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
