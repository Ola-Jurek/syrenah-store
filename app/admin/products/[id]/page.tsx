"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
};

type Image = {
  id?: string;
  url: string;
  altPl: string;
  altEn: string;
  isPrimary: boolean;
  _delete?: boolean;
};

type Product = {
  id: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string | null;
  descriptionEn: string | null;
  pricePln: number;
  priceEur: number;
  stock: number;
  sku: string | null;
  slug: string;
  categoryId: string;
  category: Category;
  images: Image[];
};

type ProductResponse = {
  product: Product;
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namePl: "",
    nameEn: "",
    descriptionPl: "",
    descriptionEn: "",
    pricePln: "",
    priceEur: "",
    stock: "0",
    sku: "",
    slug: "",
    categoryId: "",
    sizes: "", // Tekst oddzielony przecinkami
    colors: "", // Tekst oddzielony przecinkami
  });

  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    async function fetchData() {
      const token = getAdminToken();
      if (!token) {
        const promptedToken = promptAdminToken();
        if (!promptedToken) {
          setError("Brak tokena admina");
          setLoading(false);
          return;
        }
      }

      const finalToken = getAdminToken();
      if (!finalToken) return;

      try {
        // Fetch product and categories in parallel
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`, {
            headers: { "x-admin-token": finalToken },
          }),
          fetch("/api/admin/categories", {
            headers: { "x-admin-token": finalToken },
          }),
        ]);

        if (productRes.status === 401 || categoriesRes.status === 401) {
          setError("Nieautoryzowany dostęp");
          setLoading(false);
          return;
        }

        if (productRes.status === 404) {
          setError("Produkt nie znaleziony");
          setLoading(false);
          return;
        }

        if (!productRes.ok || !categoriesRes.ok) {
          throw new Error("Błąd pobierania danych");
        }

        const productData: ProductResponse = await productRes.json();
        const categoriesData: CategoriesResponse = await categoriesRes.json();

        setProduct(productData.product);
        setCategories(categoriesData.categories);

        // Parsuj sizes i colors z JSON do tekstu oddzielonego przecinkami
        const sizesArray = productData.product.sizes 
          ? (Array.isArray(productData.product.sizes) ? productData.product.sizes : JSON.parse(productData.product.sizes as string))
          : [];
        const colorsArray = productData.product.colors
          ? (Array.isArray(productData.product.colors) ? productData.product.colors : JSON.parse(productData.product.colors as string))
          : [];

        // Set form data
        setFormData({
          namePl: productData.product.namePl,
          nameEn: productData.product.nameEn,
          descriptionPl: productData.product.descriptionPl || "",
          descriptionEn: productData.product.descriptionEn || "",
          pricePln: productData.product.pricePln.toString(),
          priceEur: productData.product.priceEur.toString(),
          stock: productData.product.stock.toString(),
          sku: productData.product.sku || "",
          slug: productData.product.slug,
          categoryId: productData.product.categoryId,
          sizes: sizesArray.join(", "),
          colors: colorsArray.join(", "),
        });

        // Set images
        setImages(
          productData.product.images.map((img) => ({
            id: img.id,
            url: img.url,
            altPl: img.altPl || "",
            altEn: img.altEn || "",
            isPrimary: img.isPrimary,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd pobierania danych");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleImageChange = (
    visibleIndex: number,
    field: "url" | "altPl" | "altEn" | "isPrimary",
    value: string | boolean
  ) => {
    // Find actual index in full images array
    const visibleImages = images.filter((img) => !img._delete);
    const img = visibleImages[visibleIndex];
    if (!img) return;

    const actualIndex = images.findIndex((i) => i === img);
    if (actualIndex === -1) return;

    const newImages = [...images];
    newImages[actualIndex] = { ...newImages[actualIndex], [field]: value };
    setImages(newImages);
  };

  const handleAddImage = () => {
    setImages([...images, { url: "", altPl: "", altEn: "", isPrimary: false }]);
  };

  const handleFileUpload = async (file: File, visibleIndex: number) => {
    const token = getAdminToken();
    if (!token) {
      setUploadError("Brak tokena admina");
      return;
    }

    // Find actual index in full images array
    const visibleImages = images.filter((img) => !img._delete);
    const img = visibleImages[visibleIndex];
    if (!img) return;

    const actualIndex = images.findIndex((i) => i === img);
    if (actualIndex === -1) return;

    setUploading({ ...uploading, [visibleIndex]: true });
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-token": token,
        },
        body: formData,
      });

      if (res.status === 401) {
        setUploadError("Nieautoryzowany dostęp");
        setUploading({ ...uploading, [visibleIndex]: false });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd przesyłania pliku");
      }

      const data = await res.json();
      const newImages = [...images];
      newImages[actualIndex] = { ...newImages[actualIndex], url: data.url };
      setImages(newImages);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Błąd przesyłania pliku");
    } finally {
      setUploading({ ...uploading, [visibleIndex]: false });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, visibleIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileUpload(file, visibleIndex);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    // Find actual index in full images array (including deleted ones)
    const visibleImages = images.filter((img) => !img._delete);
    const img = visibleImages[index];
    if (!img) return;

    const actualIndex = images.findIndex((i) => i === img);
    if (actualIndex === -1) return;

    if (img.id) {
      // Mark for deletion
      const newImages = [...images];
      newImages[actualIndex] = { ...newImages[actualIndex], _delete: true };
      setImages(newImages);
    } else {
      // Remove new image
      setImages(images.filter((_, i) => i !== actualIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = getAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setSaving(false);
      return;
    }

    try {
      // Parsuj sizes i colors z tekstu oddzielonego przecinkami na tablice
      const sizesArray = formData.sizes
        ? formData.sizes.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : [];
      const colorsArray = formData.colors
        ? formData.colors.split(",").map(c => c.trim()).filter(c => c.length > 0)
        : [];

      const body = {
        ...formData,
        pricePln: parseFloat(formData.pricePln),
        priceEur: parseFloat(formData.priceEur || formData.pricePln),
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        descriptionPl: formData.descriptionPl || null,
        descriptionEn: formData.descriptionEn || null,
        sizes: sizesArray.length > 0 ? sizesArray : null,
        colors: colorsArray.length > 0 ? colorsArray : null,
        images: images,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        setError("Nieautoryzowany dostęp");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd aktualizacji produktu");
      }

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd aktualizacji produktu");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) {
      return;
    }

    setDeleting(true);
    setError(null);

    const token = getAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setDeleting(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token,
        },
      });

      if (res.status === 401) {
        setError("Nieautoryzowany dostęp");
        setDeleting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd usuwania produktu");
      }

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd usuwania produktu");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-4xl">
        <div className="text-center text-black/60 mb-4">{error}</div>
        <Button asChild variant="outline" className="border-black/20 text-black/70 hover:bg-black/5">
          <Link href="/admin/products">Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-black">Edytuj produkt</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            {deleting ? "Usuwanie..." : "Usuń produkt"}
          </Button>
          <Button asChild variant="outline" className="border-black/20 text-black/70 hover:bg-black/5">
            <Link href="/admin/products">Anuluj</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-black/5 text-black/70 rounded-md text-sm border border-black/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6 border-black/10 bg-white">
          <CardHeader>
            <CardTitle className="text-black">Podstawowe informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="namePl" className="text-black/70">
                Nazwa PL *
              </Label>
              <Input
                id="namePl"
                value={formData.namePl}
                onChange={(e) =>
                  setFormData({ ...formData, namePl: e.target.value })
                }
                required
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
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
                className="mt-1 border-black/20 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="categoryId" className="text-black/70">
                Kategoria *
              </Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
                className="mt-1 w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black/20"
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.namePl}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-black/10 bg-white">
          <CardHeader>
            <CardTitle className="text-black">Opis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black/20"
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
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-black/10 bg-white">
          <CardHeader>
            <CardTitle className="text-black">Cena i stan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePln" className="text-black/70">
                  Cena PLN *
                </Label>
                <Input
                  id="pricePln"
                  type="number"
                  step="0.01"
                  value={formData.pricePln}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePln: e.target.value })
                  }
                  required
                  className="mt-1 border-black/20"
                />
              </div>

              <div>
                <Label htmlFor="priceEur" className="text-black/70">
                  Cena EUR
                </Label>
                <Input
                  id="priceEur"
                  type="number"
                  step="0.01"
                  value={formData.priceEur}
                  onChange={(e) =>
                    setFormData({ ...formData, priceEur: e.target.value })
                  }
                  className="mt-1 border-black/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock" className="text-black/70">
                  Stan magazynowy *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                  className="mt-1 border-black/20"
                />
              </div>

              <div>
                <Label htmlFor="sku" className="text-black/70">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="mt-1 border-black/20 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sizes" className="text-black/70">
                  Rozmiary (oddzielone przecinkami, np. XS, S, M, L)
                </Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) =>
                    setFormData({ ...formData, sizes: e.target.value })
                  }
                  placeholder="XS, S, M, L"
                  className="mt-1 border-black/20"
                />
              </div>

              <div>
                <Label htmlFor="colors" className="text-black/70">
                  Kolory (oddzielone przecinkami, np. #FF0000, #00FF00)
                </Label>
                <Input
                  id="colors"
                  value={formData.colors}
                  onChange={(e) =>
                    setFormData({ ...formData, colors: e.target.value })
                  }
                  placeholder="#FF0000, #00FF00"
                  className="mt-1 border-black/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-black/10 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Zdjęcia</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
                className="border-black/20 text-black/70 hover:bg-black/5"
              >
                Dodaj zdjęcie
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                {uploadError}
              </div>
            )}
            {images.filter((img) => !img._delete).length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-black/50">Brak zdjęć</p>
                <div>
                  <Label htmlFor="file-upload-edit-new" className="text-black/70">
                    Wybierz plik
                  </Label>
                  <Input
                    id="file-upload-edit-new"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const currentVisibleCount = images.filter((img) => !img._delete).length;
                        handleAddImage();
                        // Use setTimeout to wait for state update
                        setTimeout(() => {
                          handleFileUpload(file, currentVisibleCount);
                        }, 0);
                      }
                      e.target.value = "";
                    }}
                    className="mt-1 border-black/20"
                  />
                </div>
              </div>
            ) : (
              images
                .filter((img) => !img._delete)
                .map((img, index) => {
                  return (
                    <div
                      key={img.id || `new-${index}`}
                      className={`p-4 border rounded-lg space-y-3 ${
                        img._delete ? "opacity-50" : "border-black/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-black/70">
                          Zdjęcie {index + 1}
                          {img.isPrimary && (
                            <span className="ml-2 text-xs text-black/50">
                              (Główne)
                            </span>
                          )}
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="border-black/20 text-black/70 hover:bg-black/5"
                        >
                          Usuń
                        </Button>
                      </div>
                      
                      {uploading[index] ? (
                        <div className="flex items-center justify-center py-8 border border-black/10 rounded bg-black/5">
                          <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-black/20 border-t-black mb-2"></div>
                            <p className="text-sm text-black/60">Przesyłanie...</p>
                          </div>
                        </div>
                      ) : img.url ? (
                        <img
                          src={img.url}
                          alt={img.altPl || "Preview"}
                          className="w-full h-48 object-cover rounded border border-black/10"
                        />
                      ) : (
                        <div>
                          <Label htmlFor={`file-upload-edit-${index}`} className="text-black/70">
                            Wybierz plik
                          </Label>
                          <Input
                            id={`file-upload-edit-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, index)}
                            className="mt-1 border-black/20"
                          />
                        </div>
                      )}
                      <div>
                        <Label
                          htmlFor={`img-url-${index}`}
                          className="text-black/70"
                        >
                          URL {img.url ? "(z Supabase)" : "*"}
                        </Label>
                        <Input
                          id={`img-url-${index}`}
                          value={img.url}
                          onChange={(e) =>
                            handleImageChange(index, "url", e.target.value)
                          }
                          placeholder="https://... lub wybierz plik powyżej"
                          className="mt-1 border-black/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor={`img-altPl-${index}`}
                            className="text-black/70"
                          >
                            Alt PL
                          </Label>
                          <Input
                            id={`img-altPl-${index}`}
                            value={img.altPl}
                            onChange={(e) =>
                              handleImageChange(
                                index,
                                "altPl",
                                e.target.value
                              )
                            }
                            className="mt-1 border-black/20"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`img-altEn-${index}`}
                            className="text-black/70"
                          >
                            Alt EN
                          </Label>
                          <Input
                            id={`img-altEn-${index}`}
                            value={img.altEn}
                            onChange={(e) =>
                              handleImageChange(
                                index,
                                "altEn",
                                e.target.value
                              )
                            }
                            className="mt-1 border-black/20"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`img-primary-${index}`}
                          checked={img.isPrimary}
                          onChange={(e) =>
                            handleImageChange(
                              index,
                              "isPrimary",
                              e.target.checked
                            )
                          }
                          className="mr-2"
                        />
                        <Label
                          htmlFor={`img-primary-${index}`}
                          className="text-black/70"
                        >
                          Główne zdjęcie
                        </Label>
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-black text-white hover:bg-black/90 disabled:opacity-50"
          >
            {saving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
          <Button
            type="button"
            variant="outline"
            asChild
            className="border-black/20 text-black/70 hover:bg-black/5"
          >
            <Link href="/admin/products">Anuluj</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

