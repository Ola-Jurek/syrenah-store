"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { Tag, Plus, Pencil, Trash2, X, Check, Layers } from "lucide-react";

/* ───────────── Types ───────────── */

type Discount = {
  id: string;
  code: string;
  namePl: string | null;
  nameEn: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  productsCount: number;
};

type FormData = {
  code: string;
  namePl: string;
  nameEn: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

type Category = {
  id: string;
  namePl: string;
  slug: string;
};

const emptyForm: FormData = {
  code: "",
  namePl: "",
  nameEn: "",
  type: "PERCENTAGE",
  value: "",
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: "",
  isActive: true,
};

/* ───────────── Helpers ───────────── */

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

function toLocalDatetimeString(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ───────────── Component ───────────── */

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Zastosuj do kategorii
  const [showCategoryModal, setShowCategoryModal] = useState<string | null>(null); // discountId
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [applyingCategory, setApplyingCategory] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  /* ── Auth ── */
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      const prompted = promptAdminToken();
      if (!prompted) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }
    }
    setTokenChecked(true);
  }, []);

  /* ── Fetch ── */
  useEffect(() => {
    if (!tokenChecked) return;
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenChecked]);

  async function fetchDiscounts() {
    const token = getAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/discounts", {
        headers: { "x-admin-token": token },
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        setError("Nieautoryzowany dostęp.");
        const newToken = promptAdminToken();
        if (newToken) fetchDiscounts();
        return;
      }

      if (!res.ok) throw new Error("Błąd pobierania rabatów");

      const data = await res.json();
      setDiscounts(data.discounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd pobierania rabatów");
    } finally {
      setLoading(false);
    }
  }

  /* ── Open form for new / edit ── */
  function openNewForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function openEditForm(d: Discount) {
    setEditingId(d.id);
    setFormData({
      code: d.code,
      namePl: d.namePl || "",
      nameEn: d.nameEn || "",
      type: d.type,
      value: d.value.toString(),
      validFrom: toLocalDatetimeString(d.validFrom),
      validUntil: toLocalDatetimeString(d.validUntil),
      isActive: d.isActive,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  }

  /* ── Save (POST / PATCH) ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = getAdminToken();
    if (!token) {
      setError("Brak tokena admina");
      setSaving(false);
      return;
    }

    const body = {
      code: formData.code,
      namePl: formData.namePl || null,
      nameEn: formData.nameEn || null,
      type: formData.type,
      value: parseFloat(formData.value),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: formData.validUntil
        ? new Date(formData.validUntil).toISOString()
        : null,
      isActive: formData.isActive,
    };

    try {
      const isEdit = !!editingId;
      const url = isEdit
        ? `/api/admin/discounts/${editingId}`
        : "/api/admin/discounts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
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
        throw new Error(data.error || "Błąd zapisu rabatu");
      }

      toast.success(isEdit ? "Rabat zaktualizowany!" : "Rabat utworzony!");
      closeForm();
      await fetchDiscounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd zapisu rabatu";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć ten rabat?")) return;

    const token = getAdminToken();
    if (!token) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd usuwania rabatu");
      }

      toast.success("Rabat usunięty!");
      await fetchDiscounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd usuwania rabatu";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Toggle active ── */
  async function toggleActive(d: Discount) {
    const token = getAdminToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/discounts/${d.id}`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !d.isActive }),
      });

      if (!res.ok) throw new Error("Błąd zmiany statusu");

      toast.success(
        d.isActive ? "Rabat dezaktywowany" : "Rabat aktywowany"
      );
      await fetchDiscounts();
    } catch {
      toast.error("Nie udało się zmienić statusu rabatu");
    }
  }

  /* ── Apply to category ── */
  async function openCategoryModal(discountId: string) {
    setShowCategoryModal(discountId);
    setSelectedCategoryId("");

    if (!categoriesLoaded) {
      const token = getAdminToken();
      if (!token) return;

      try {
        const res = await fetch("/api/admin/categories", {
          headers: { "x-admin-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
          setCategoriesLoaded(true);
        }
      } catch {
        toast.error("Nie udało się pobrać kategorii");
      }
    }
  }

  async function handleApplyToCategory() {
    if (!showCategoryModal || !selectedCategoryId) return;

    const token = getAdminToken();
    if (!token) return;

    setApplyingCategory(true);
    try {
      const res = await fetch("/api/admin/discounts/apply-category", {
        method: "POST",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountId: showCategoryModal,
          categoryId: selectedCategoryId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd przypisywania rabatu");
      }

      toast.success(data.message);
      setShowCategoryModal(null);
      await fetchDiscounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd przypisywania";
      toast.error(msg);
    } finally {
      setApplyingCategory(false);
    }
  }

  /* ───────── Render ───────── */

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  if (error && discounts.length === 0 && !showForm) {
    return (
      <div className="text-center text-black/60 py-12">{error}</div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#FDFBF7",
            border: "1px solid #E8E3D8",
            color: "#1a1a1a",
            fontSize: "13px",
          },
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-[#C1A88C]" strokeWidth={1.5} />
          <h1 className="text-2xl font-medium text-black">Rabaty</h1>
        </div>
        {!showForm && (
          <Button
            onClick={openNewForm}
            className="bg-black text-white hover:bg-black/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nowy rabat
          </Button>
        )}
      </div>

      {/* ───── Form (inline) ───── */}
      {showForm && (
        <Card className="mb-8 border-[#E8E3D8] bg-[#FDFBF7]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black text-lg">
                {editingId ? "Edytuj rabat" : "Nowy rabat"}
              </CardTitle>
              <button
                onClick={closeForm}
                className="text-black/40 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-black/5 text-black/70 rounded-md text-sm border border-black/10">
                  {error}
                </div>
              )}

              {/* Row 1: Nazwa + Kod */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namePl" className="text-black/70 text-xs uppercase tracking-wider">
                    Nazwa
                  </Label>
                  <Input
                    id="namePl"
                    value={formData.namePl}
                    onChange={(e) =>
                      setFormData({ ...formData, namePl: e.target.value })
                    }
                    placeholder="np. Oferta Walentynkowa"
                    className="mt-1 border-[#E8E3D8] focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                  />
                </div>
                <div>
                  <Label htmlFor="code" className="text-black/70 text-xs uppercase tracking-wider">
                    Kod *
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="np. WALENTYNKI2026"
                    required
                    className="mt-1 border-[#E8E3D8] font-mono text-sm focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                  />
                </div>
              </div>

              {/* Row 2: Nazwa EN */}
              <div>
                <Label htmlFor="nameEn" className="text-black/70 text-xs uppercase tracking-wider">
                  Nazwa EN
                </Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  placeholder="np. Valentine Offer"
                  className="mt-1 border-[#E8E3D8] focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                />
              </div>

              {/* Row 3: Typ + Wartość */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-black/70 text-xs uppercase tracking-wider">
                    Typ *
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "PERCENTAGE" | "FIXED",
                      })
                    }
                    className="mt-1 w-full px-3 py-2 border border-[#E8E3D8] rounded-md bg-white text-black text-sm focus:outline-none focus:ring-1 focus:ring-[#C1A88C]/20 focus:border-[#C1A88C]"
                  >
                    <option value="PERCENTAGE">Procentowy (%)</option>
                    <option value="FIXED">Kwotowy (PLN)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="value" className="text-black/70 text-xs uppercase tracking-wider">
                    Wartość *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={formData.type === "PERCENTAGE" ? "np. 15" : "np. 50.00"}
                    required
                    className="mt-1 border-[#E8E3D8] focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                  />
                </div>
              </div>

              {/* Row 4: Daty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom" className="text-black/70 text-xs uppercase tracking-wider">
                    Data od *
                  </Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                    className="mt-1 border-[#E8E3D8] focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil" className="text-black/70 text-xs uppercase tracking-wider">
                    Data do
                  </Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    className="mt-1 border-[#E8E3D8] focus:border-[#C1A88C] focus:ring-[#C1A88C]/20"
                  />
                  <p className="text-xs text-black/40 mt-1">
                    Zostaw puste = rabat bezterminowy
                  </p>
                </div>
              </div>

              {/* Row 5: Aktywny */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    formData.isActive ? "bg-[#C1A88C]" : "bg-black/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      formData.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <Label className="text-black/70 text-sm cursor-pointer">
                  {formData.isActive ? "Aktywny" : "Nieaktywny"}
                </Label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-black text-white hover:bg-black/90 disabled:opacity-50"
                >
                  {saving
                    ? "Zapisywanie..."
                    : editingId
                    ? "Zapisz zmiany"
                    : "Utwórz rabat"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  className="border-[#E8E3D8] text-black/60 hover:bg-[#E8E3D8]/50"
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ───── Table (Desktop) ───── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#E8E3D8]">
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Kod
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Nazwa
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Typ
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Wartość
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Ważność
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Produkty
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-black/40">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-8 w-8 text-black/20" />
                    <p>Brak rabatów</p>
                    <p className="text-xs text-black/30">
                      Kliknij &quot;Dodaj nowy rabat&quot; aby rozpocząć
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              discounts.map((d) => {
                const isExpired =
                  d.validUntil && new Date(d.validUntil) < new Date();

                return (
                  <tr
                    key={d.id}
                    className="border-b border-black/5 hover:bg-[#FDFBF7]/60 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-black/80 bg-[#E8E3D8]/30 px-2 py-0.5 rounded">
                        {d.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-black/70">
                      {d.namePl || "—"}
                    </td>
                    <td className="py-4 px-4 text-sm text-black/60">
                      {d.type === "PERCENTAGE" ? "Procentowy" : "Kwotowy"}
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-medium text-[#C1A88C]">
                      {d.type === "PERCENTAGE"
                        ? `${d.value}%`
                        : `${d.value.toFixed(2)} PLN`}
                    </td>
                    <td className="py-4 px-4 text-xs text-black/50">
                      <div>{formatDate(d.validFrom)}</div>
                      <div>
                        {d.validUntil
                          ? `→ ${formatDate(d.validUntil)}`
                          : "→ bezterminowo"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleActive(d)}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                        title={d.isActive ? "Kliknij aby dezaktywować" : "Kliknij aby aktywować"}
                      >
                        {isExpired ? (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-black/10 text-black/40">
                            Wygasł
                          </span>
                        ) : d.isActive ? (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-[#C1A88C]/15 text-[#C1A88C]">
                            Aktywny
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-black/5 text-black/40">
                            Nieaktywny
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-black/50">
                      {d.productsCount}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openCategoryModal(d.id)}
                          className="p-1.5 text-black/40 hover:text-[#C1A88C] transition-colors rounded"
                          title="Zastosuj do kategorii"
                        >
                          <Layers className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(d)}
                          className="p-1.5 text-black/40 hover:text-[#C1A88C] transition-colors rounded"
                          title="Edytuj"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={deletingId === d.id}
                          className="p-1.5 text-black/40 hover:text-red-500 transition-colors rounded disabled:opacity-30"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ───── Modal: Zastosuj do kategorii ───── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-[#E8E3D8] shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#C1A88C]" />
                <h3 className="text-sm font-medium text-black uppercase tracking-wider">
                  Zastosuj do kategorii
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(null)}
                className="text-black/40 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-black/50 mb-4">
              Rabat zostanie przypisany do <strong>wszystkich produktów</strong> w
              wybranej kategorii.
            </p>

            <div className="mb-6">
              <Label className="text-black/70 text-xs uppercase tracking-wider">
                Kategoria
              </Label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#E8E3D8] rounded-md bg-white text-black text-sm focus:outline-none focus:ring-1 focus:ring-[#C1A88C]/20 focus:border-[#C1A88C]"
              >
                <option value="">Wybierz kategorię...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.namePl}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleApplyToCategory}
                disabled={!selectedCategoryId || applyingCategory}
                className="bg-black text-white hover:bg-black/90 disabled:opacity-40"
              >
                {applyingCategory ? "Przypisywanie..." : "Zastosuj"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryModal(null)}
                className="border-[#E8E3D8] text-black/60 hover:bg-[#E8E3D8]/50"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Cards (Mobile) ───── */}
      <div className="md:hidden space-y-4">
        {discounts.length === 0 ? (
          <div className="text-center text-black/40 py-12">
            <Tag className="h-8 w-8 mx-auto mb-2 text-black/20" />
            <p>Brak rabatów</p>
          </div>
        ) : (
          discounts.map((d) => {
            const isExpired =
              d.validUntil && new Date(d.validUntil) < new Date();

            return (
              <Card key={d.id} className="border-[#E8E3D8] bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-sm text-black/80 bg-[#E8E3D8]/30 px-2 py-0.5 rounded">
                        {d.code}
                      </span>
                      {d.namePl && (
                        <p className="text-sm text-black/60 mt-1">{d.namePl}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpired ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-black/10 text-black/40">
                          Wygasł
                        </span>
                      ) : d.isActive ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-[#C1A88C]/15 text-[#C1A88C]">
                          Aktywny
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-sm bg-black/5 text-black/40">
                          Nieaktywny
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-black/40 uppercase tracking-wider">
                        Wartość
                      </p>
                      <p className="text-base font-medium text-[#C1A88C]">
                        {d.type === "PERCENTAGE"
                          ? `${d.value}%`
                          : `${d.value.toFixed(2)} PLN`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-black/40 uppercase tracking-wider">
                        Ważność
                      </p>
                      <p className="text-xs text-black/60">
                        {formatDate(d.validFrom)}
                        {d.validUntil
                          ? ` → ${formatDate(d.validUntil)}`
                          : " → ∞"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(d)}
                      className="flex-1 border-[#E8E3D8] text-black/60 hover:bg-[#E8E3D8]/50"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCategoryModal(d.id)}
                      className="border-[#E8E3D8] text-black/60 hover:bg-[#E8E3D8]/50"
                      title="Zastosuj do kategorii"
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(d)}
                      className="border-[#E8E3D8] text-black/60 hover:bg-[#E8E3D8]/50"
                    >
                      {d.isActive ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                      className="border-red-200 text-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
