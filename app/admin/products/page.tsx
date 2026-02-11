"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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

    async function fetchProducts() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/products", {
          headers: {
            "x-admin-token": token,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          const newToken = promptAdminToken();
          if (newToken) {
            fetchProducts();
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Błąd pobierania produktów");
        }

        const data: ProductsResponse = await res.json();
        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd pobierania produktów");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
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
        <h1 className="text-2xl font-medium text-black">Produkty</h1>
        <Button asChild className="bg-black text-white hover:bg-black/90">
          <Link href="/admin/products/new">Nowy produkt</Link>
        </Button>
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-black/40">
                  Brak produktów
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const hasPromo = !!product.activeDiscount || !!product.salePricePln;

                let discountLabel: string | null = null;
                if (product.activeDiscount) {
                  const d = product.activeDiscount;
                  const name = d.namePl ? `${d.namePl} ` : "";
                  discountLabel =
                    d.type === "PERCENTAGE"
                      ? `${name}-${d.value}%`
                      : `${name}-${d.value.toFixed(0)} zł`;
                } else if (product.salePricePln && product.pricePln > 0) {
                  const diff = product.pricePln - product.salePricePln;
                  const pct = Math.round((diff / product.pricePln) * 100);
                  discountLabel = `-${pct}% (${product.salePricePln.toFixed(2)} zł)`;
                }

                return (
                  <tr key={product.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
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
                    <td className="py-4 px-4 text-sm text-right text-black/80">
                      {product.stock}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button asChild variant="outline" size="sm" className="border-black/20 text-black/70 hover:bg-black/5">
                        <Link href={`/admin/products/${product.id}`}>Edytuj</Link>
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
        {products.length === 0 ? (
          <div className="text-center text-black/40 py-12">
            Brak produktów
          </div>
        ) : (
          products.map((product) => {
            const hasPromo = !!product.activeDiscount || !!product.salePricePln;

            let discountLabel: string | null = null;
            if (product.activeDiscount) {
              const d = product.activeDiscount;
              const name = d.namePl ? `${d.namePl} ` : "";
              discountLabel =
                d.type === "PERCENTAGE"
                  ? `${name}-${d.value}%`
                  : `${name}-${d.value.toFixed(0)} zł`;
            } else if (product.salePricePln && product.pricePln > 0) {
              const diff = product.pricePln - product.salePricePln;
              const pct = Math.round((diff / product.pricePln) * 100);
              discountLabel = `-${pct}% (${product.salePricePln.toFixed(2)} zł)`;
            }

            return (
              <Card key={product.id} className="border-black/10 bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 text-black">
                        {product.namePl}
                      </CardTitle>
                      <div className="flex items-center gap-2">
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
                    {product.primaryImage && (
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
                      <p className="text-base font-medium text-black">
                        {product.stock}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full border-black/20 text-black/70 hover:bg-black/5">
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

