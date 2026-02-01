"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [images, setImages] = useState<
    Array<{ url: string; altPl: string; altEn: string; isPrimary: boolean }>
  >([]);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
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
        const res = await fetch("/api/admin/categories", {
          headers: {
            "x-admin-token": finalToken,
          },
        });

        if (res.status === 401) {
          setError("Nieautoryzowany dostęp");
          setLoading(false);
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
  }, []);

  const handleNamePlChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      namePl: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleAddImage = () => {
    setImages([...images, { url: "", altPl: "", altEn: "", isPrimary: false }]);
  };

  const handleFileUpload = async (file: File, index: number) => {
    const token = getAdminToken();
    if (!token) {
      setUploadError("Brak tokena admina");
      return;
    }

    setUploading({ ...uploading, [index]: true });
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
        setUploading({ ...uploading, [index]: false });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd przesyłania pliku");
      }

      const data = await res.json();
      const newImages = [...images];
      newImages[index] = { ...newImages[index], url: data.url };
      setImages(newImages);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Błąd przesyłania pliku");
    } finally {
      setUploading({ ...uploading, [index]: false });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileUpload(file, index);
    // Reset input
    e.target.value = "";
  };

  const handleImageChange = (
    index: number,
    field: "url" | "altPl" | "altEn" | "isPrimary",
    value: string | boolean
  ) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
        images: images.filter((img) => img.url.trim() !== ""),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
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
        throw new Error(data.error || "Błąd tworzenia produktu");
      }

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd tworzenia produktu");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-black">Nowy produkt</h1>
        <Button asChild variant="outline" className="border-black/20 text-black/70 hover:bg-black/5">
          <Link href="/admin/products">Anuluj</Link>
        </Button>
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
                onChange={(e) => handleNamePlChange(e.target.value)}
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
            {images.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-black/50">Brak zdjęć</p>
                <div>
                  <Label htmlFor="file-upload-new" className="text-black/70">
                    Wybierz plik
                  </Label>
                  <Input
                    id="file-upload-new"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const newIndex = images.length;
                        handleAddImage();
                        setTimeout(() => handleFileUpload(file, newIndex), 0);
                      }
                      e.target.value = "";
                    }}
                    className="mt-1 border-black/20"
                  />
                </div>
              </div>
            ) : (
              images.map((img, index) => (
                <div
                  key={index}
                  className="p-4 border border-black/10 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-black/70">Zdjęcie {index + 1}</Label>
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
                    <div>
                      <img
                        src={img.url}
                        alt={img.altPl || "Preview"}
                        className="w-full h-48 object-cover rounded border border-black/10"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={`file-upload-${index}`} className="text-black/70">
                        Wybierz plik
                      </Label>
                      <Input
                        id={`file-upload-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, index)}
                        className="mt-1 border-black/20"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor={`img-url-${index}`} className="text-black/70">
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
                      <Label htmlFor={`img-altPl-${index}`} className="text-black/70">
                        Alt PL
                      </Label>
                      <Input
                        id={`img-altPl-${index}`}
                        value={img.altPl}
                        onChange={(e) =>
                          handleImageChange(index, "altPl", e.target.value)
                        }
                        className="mt-1 border-black/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`img-altEn-${index}`} className="text-black/70">
                        Alt EN
                      </Label>
                      <Input
                        id={`img-altEn-${index}`}
                        value={img.altEn}
                        onChange={(e) =>
                          handleImageChange(index, "altEn", e.target.value)
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
                        handleImageChange(index, "isPrimary", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <Label htmlFor={`img-primary-${index}`} className="text-black/70">
                      Główne zdjęcie
                    </Label>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-black text-white hover:bg-black/90 disabled:opacity-50"
          >
            {saving ? "Zapisywanie..." : "Utwórz produkt"}
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

