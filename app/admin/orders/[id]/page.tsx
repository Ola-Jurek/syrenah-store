"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ───────── Typy ───────── */

type OrderItem = {
  id: string;
  quantity: number;
  pricePln: number;
  product: {
    id: string;
    namePl: string;
    nameEn: string;
    slug: string;
    imageUrl: string | null;
  };
};

type ShippingAddress = {
  type?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  parcelLockerCode?: string;
};

type BillingAddress = {
  street?: string;
  city?: string;
  postalCode?: string;
};

type AlternateShippingAddress = {
  fullName?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
};

type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalPln: number;
  totalEur: number;
  stripeSessionId: string | null;

  shippingEmail: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingMethod: string | null;
  shippingCost: number | null;
  shippingAddress: ShippingAddress | null;

  isInvoiceRequested: boolean;
  companyName: string | null;
  vatNumber: string | null;
  billingAddress: BillingAddress | null;

  isDifferentShippingAddress: boolean;
  alternateShippingAddress: AlternateShippingAddress | null;

  items: OrderItem[];
};

type OrderResponse = {
  order: Order;
};

/* ───────── Helpers ───────── */

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenId(id: string): string {
  return `${id.slice(0, 8)}...`;
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "text-green-700 bg-green-100 border-green-200";
    case "PENDING":
      return "text-amber-700 bg-amber-100 border-amber-200";
    case "PROCESSING":
    case "SHIPPED":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "CANCELLED":
    case "FAILED":
      return "text-red-700 bg-red-100 border-red-200";
    case "REFUNDED":
      return "text-gray-700 bg-gray-100 border-gray-200";
    default:
      return "text-black/70 bg-black/5 border-black/10";
  }
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    PENDING: "Oczekujące",
    PAID: "Opłacone",
    PROCESSING: "Przetwarzane",
    SHIPPED: "Wysłane",
    DELIVERED: "Dostarczone",
    CANCELLED: "Anulowane",
    FAILED: "Nieudane",
    REFUNDED: "Zwrócone",
  };
  return translations[status] || status;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Oczekujące" },
  { value: "PROCESSING", label: "Przetwarzane" },
  { value: "SHIPPED", label: "Wysłane" },
  { value: "DELIVERED", label: "Dostarczone" },
  { value: "CANCELLED", label: "Anulowane" },
  { value: "REFUNDED", label: "Zwrócone" },
];

/* ───────── Mini-komponent sekcji ───────── */
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-black/40 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-black/80">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STRONA GŁÓWNA
   ═══════════════════════════════════════════ */

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          headers: {
            "x-admin-token": token,
          },
        });

        if (res.status === 401) {
          setError("Nieautoryzowany dostęp");
          setLoading(false);
          return;
        }

        if (res.status === 404) {
          setError("Zamówienie nie znalezione");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Błąd pobierania zamówienia");
        }

        const data: OrderResponse = await res.json();
        setOrder(data.order);
        setSelectedStatus(data.order.status);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Błąd pobierania zamówienia"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  async function handleSaveStatus() {
    const token = getAdminToken();
    if (!token || !order) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (res.status === 401) {
        setError("Nieautoryzowany dostęp");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd aktualizacji statusu");
      }

      // Aktualizuj lokalny stan
      setOrder({ ...order, status: selectedStatus });
      setSaveMessage("Zapisano");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Błąd aktualizacji statusu"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-4xl">
        <div className="text-center text-black/60 mb-4">{error}</div>
        <Button
          asChild
          variant="outline"
          className="border-black/20 text-black/70 hover:bg-black/5"
        >
          <Link href="/admin/orders">Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  /* ─── Dane pomocnicze ─── */
  const addr = order.shippingAddress as ShippingAddress | null;
  const isParcelLocker =
    order.shippingMethod === "parcel_locker" ||
    addr?.type === "parcel_locker";
  const billing = order.billingAddress as BillingAddress | null;
  const altShip =
    order.alternateShippingAddress as AlternateShippingAddress | null;

  // Wyodrębnij imię i nazwisko
  const nameParts = order.shippingName?.split(" ") ?? [];
  const firstName = nameParts[0] || "—";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="max-w-5xl">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-black mb-1">Zamówienie</h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-black/50 font-mono">
              {shortenId(order.id)}
            </p>
            <Badge
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusClasses(
                order.status
              )}`}
            >
              {translateStatus(order.status)}
            </Badge>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-black/20 text-black/70 hover:bg-black/5"
        >
          <Link href="/admin/orders">← Wróć do listy</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-black/5 text-black/70 rounded-md text-sm border border-black/10">
          {error}
        </div>
      )}

      {/* ─── Grid: 2 kolumny na desktop ─── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* ══════════ DANE KLIENTA ══════════ */}
        <Card className="border-black/10 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
              Dane klienta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Imię" value={firstName} />
              <InfoRow label="Nazwisko" value={lastName || "—"} />
            </div>
            <InfoRow label="Email" value={order.shippingEmail || "—"} />
            <InfoRow label="Telefon" value={order.shippingPhone || "—"} />
          </CardContent>
        </Card>

        {/* ══════════ DOSTAWA ══════════ */}
        <Card className="border-black/10 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
              Dostawa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Metoda"
              value={
                isParcelLocker ? "Paczkomat InPost" : "Kurier"
              }
            />
            {order.shippingCost !== null && (
              <InfoRow
                label="Koszt dostawy"
                value={`${order.shippingCost.toFixed(2)} zł`}
              />
            )}

            {isParcelLocker && addr?.parcelLockerCode && (
              <>
                <InfoRow label="ID Paczkomatu" value={addr.parcelLockerCode} />
                <InfoRow
                  label="Adres paczkomatu"
                  value={[addr.street, [addr.postalCode, addr.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                />
              </>
            )}

            {!isParcelLocker && addr && (
              <InfoRow
                label="Adres"
                value={[addr.street, [addr.postalCode, addr.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
              />
            )}

            {/* Inny adres dostawy */}
            {order.isDifferentShippingAddress && altShip && (
              <div className="pt-3 mt-3 border-t border-black/10">
                <p className="text-xs uppercase tracking-wider text-[#C1A88C] font-semibold mb-2">
                  Adres do wysyłki (inny)
                </p>
                {altShip.fullName && (
                  <InfoRow label="Odbiorca" value={altShip.fullName} />
                )}
                <InfoRow
                  label="Adres"
                  value={[altShip.street, [altShip.postalCode, altShip.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                />
                {altShip.phone && (
                  <InfoRow label="Telefon" value={altShip.phone} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════════ FAKTURA (warunkowo) ══════════ */}
      {order.isInvoiceRequested && (
        <Card className="border-black/10 bg-white mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
              Dane do faktury
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Nazwa firmy" value={order.companyName || "—"} />
              <InfoRow label="NIP" value={order.vatNumber || "—"} />
            </div>
            {billing && (
              <InfoRow
                label="Adres firmy"
                value={[billing.street, [billing.postalCode, billing.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════ INFORMACJE O ZAMÓWIENIU ══════════ */}
      <Card className="mb-6 border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
            Szczegóły zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoRow label="Data" value={formatDate(order.createdAt)} />
            <InfoRow
              label="Suma PLN"
              value={`${order.totalPln.toFixed(2)} zł`}
            />
            <InfoRow
              label="Status"
              value={
                <Badge
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {translateStatus(order.status)}
                </Badge>
              }
            />
            {order.stripeSessionId && (
              <InfoRow
                label="Stripe Session"
                value={
                  <span className="font-mono text-[11px] break-all">
                    {order.stripeSessionId}
                  </span>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ══════════ ZMIANA STATUSU ══════════ */}
      <Card className="mb-6 border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
            Zmiana statusu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm text-black/50 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-black/20 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSaveStatus}
              disabled={saving || selectedStatus === order.status}
              className="bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
          {saveMessage && (
            <p className="mt-3 text-sm text-black/60">{saveMessage}</p>
          )}
        </CardContent>
      </Card>

      {/* ══════════ PRODUKTY ══════════ */}
      <Card className="border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-black/50 font-medium">
            Produkty ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-black/40 uppercase tracking-wider w-14">
                    &nbsp;
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-black/40 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="text-right py-2 px-3 text-[10px] font-medium text-black/40 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="text-center py-2 px-3 text-[10px] font-medium text-black/40 uppercase tracking-wider">
                    Ilość
                  </th>
                  <th className="text-right py-2 px-3 text-[10px] font-medium text-black/40 uppercase tracking-wider">
                    Razem
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-black/5 hover:bg-black/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="w-10 h-10 bg-black/5 rounded overflow-hidden relative flex-shrink-0">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.namePl}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black/20 text-[10px]">
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-black">
                        {item.product.namePl}
                      </p>
                      {item.product.nameEn && (
                        <p className="text-[11px] text-black/40">
                          {item.product.nameEn}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-right text-black/70">
                      {item.pricePln.toFixed(2)} zł
                    </td>
                    <td className="py-3 px-3 text-sm text-center text-black/70">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-sm text-right font-medium text-black">
                      {(item.pricePln * item.quantity).toFixed(2)} zł
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 border border-black/10 rounded-lg"
              >
                <div className="w-12 h-12 bg-black/5 rounded overflow-hidden relative flex-shrink-0">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.namePl}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/20 text-[10px]">
                      —
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {item.product.namePl}
                  </p>
                  <p className="text-xs text-black/50">
                    {item.pricePln.toFixed(2)} zł × {item.quantity}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-black">
                    {(item.pricePln * item.quantity).toFixed(2)} zł
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
