"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderItem = {
  id: string;
  quantity: number;
  pricePln: number;
  product: {
    id: string;
    namePl: string;
    nameEn: string;
    slug: string;
  };
};

type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalPln: number;
  totalEur: number;
  stripeSessionId: string | null;
  items: OrderItem[];
};

type OrderResponse = {
  order: Order;
};

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
        setError(err instanceof Error ? err.message : "Błąd pobierania zamówienia");
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
      setError(err instanceof Error ? err.message : "Błąd aktualizacji statusu");
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
        <Button asChild variant="outline" className="border-black/20 text-black/70 hover:bg-black/5">
          <Link href="/admin/orders">Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-black mb-1">Zamówienie</h1>
          <p className="text-sm text-black/50 font-mono">
            {shortenId(order.id)}
          </p>
        </div>
        <Button asChild variant="outline" className="border-black/20 text-black/70 hover:bg-black/5">
          <Link href="/admin/orders">Wróć do listy</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-black/5 text-black/70 rounded-md text-sm border border-black/10">
          {error}
        </div>
      )}

      {/* Order Info */}
      <Card className="mb-6 border-black/10 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Informacje o zamówieniu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-black/50 mb-1">Data</p>
              <p className="font-medium text-black">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-black/50 mb-1">Status</p>
              <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusClasses(order.status)}`}>
                {translateStatus(order.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-black/50 mb-1">Suma PLN</p>
              <p className="font-medium text-black">{order.totalPln.toFixed(2)} zł</p>
            </div>
            {order.stripeSessionId && (
              <div>
                <p className="text-sm text-black/50 mb-1">
                  Stripe Session ID
                </p>
                <p className="font-mono text-sm text-black/70">{order.stripeSessionId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Status */}
      <Card className="mb-6 border-black/10 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Zmiana statusu</CardTitle>
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
            <p className="mt-3 text-sm text-black/60">
              {saveMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card className="border-black/10 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Produkty ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-black/10 rounded-lg bg-white"
              >
                <div className="flex-1">
                  <h3 className="font-medium mb-1 text-black">{item.product.namePl}</h3>
                  {item.product.nameEn && (
                    <p className="text-sm text-black/50">
                      {item.product.nameEn}
                    </p>
                  )}
                  <p className="text-xs text-black/40 mt-1 font-mono">
                    {item.product.slug}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-black/50">Ilość</p>
                    <p className="font-medium text-black">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black/50">Cena PLN</p>
                    <p className="font-medium text-black">{item.pricePln.toFixed(2)} zł</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

