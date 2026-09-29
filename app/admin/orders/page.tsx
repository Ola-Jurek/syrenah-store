"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAdminToken,
  getAdminToken,
  promptAdminToken,
} from "@/lib/adminToken";

type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalPln: number;
  itemCount: number;
  stripeSessionId?: string | null;
};

type OrdersResponse = {
  orders: Order[];
};

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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

    async function fetchOrders() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/orders", {
          headers: {
            "x-admin-token": token,
          },
        });

        if (res.status === 401) {
          clearAdminToken();
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          const newToken = promptAdminToken();
          if (newToken) {
            fetchOrders();
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Błąd pobierania zamówień");
        }

        const data: OrdersResponse = await res.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd pobierania zamówień");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [tokenChecked]);

  const handleExportCSV = async () => {
    const token = getAdminToken();
    if (!token) return;

    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "xls" });
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          "x-admin-token": token,
        },
      });

      if (!res.ok) {
        throw new Error("Błąd eksportu CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      const statusSuffix = statusFilter ? `_${statusFilter.toLowerCase()}` : "";
      a.download = `zamowienia${statusSuffix}_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Nie udało się wyeksportować zamówień.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-black/40">Ładowanie...</div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-black/60">{error}</div>
    );
  }

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-black">Zamówienia</h1>
          <p className="mt-1 text-xs text-black/40">
            Plik Excela uwzględnia aktywny filtr statusu
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={exporting || orders.length === 0}
          className="w-full rounded-none bg-[#C1A88C] px-6 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-[#B09A7C] sm:w-auto"
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          {exporting ? "Eksportowanie..." : "Eksportuj do Excela"}
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(null)}
          className={
            statusFilter === null
              ? "bg-black text-white hover:bg-black/90"
              : "border-black/20 text-black/70 hover:bg-black/5"
          }
        >
          Wszystkie
        </Button>
        <Button
          variant={statusFilter === "PAID" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PAID")}
          className={
            statusFilter === "PAID"
              ? "bg-black text-white hover:bg-black/90"
              : "border-black/20 text-black/70 hover:bg-black/5"
          }
        >
          PAID
        </Button>
        <Button
          variant={statusFilter === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PENDING")}
          className={
            statusFilter === "PENDING"
              ? "bg-black text-white hover:bg-black/90"
              : "border-black/20 text-black/70 hover:bg-black/5"
          }
        >
          PENDING
        </Button>
        <Button
          variant={statusFilter === "CANCELLED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("CANCELLED")}
          className={
            statusFilter === "CANCELLED"
              ? "bg-black text-white hover:bg-black/90"
              : "border-black/20 text-black/70 hover:bg-black/5"
          }
        >
          CANCELLED
        </Button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-black/50">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-black/50">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-black/50">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-black/50">
                Ilość sztuk
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-black/50">
                Suma PLN
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-black/50">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-black/40">
                  {statusFilter
                    ? `Brak zamówień ze statusem ${translateStatus(statusFilter)}`
                    : "Brak zamówień"}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/5 transition-colors hover:bg-black/5"
                >
                  <td className="px-4 py-4 text-sm text-black/80">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-black/50">
                    {shortenId(order.id)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(order.status)}`}
                    >
                      {translateStatus(order.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-black/80">
                    {order.itemCount}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-black">
                    {order.totalPln.toFixed(2)} zł
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-black/20 text-black/70 hover:bg-black/5"
                    >
                      <Link href={`/admin/orders/${order.id}`}>Szczegóły</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {sortedOrders.length === 0 ? (
          <div className="py-12 text-center text-black/40">
            {statusFilter
              ? `Brak zamówień ze statusem ${translateStatus(statusFilter)}`
              : "Brak zamówień"}
          </div>
        ) : (
          sortedOrders.map((order) => (
            <Card key={order.id} className="border-black/10 bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1 text-base text-black">
                      {formatDate(order.createdAt)}
                    </CardTitle>
                    <p className="font-mono text-xs text-black/50">
                      {shortenId(order.id)}
                    </p>
                  </div>
                  <Badge
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(order.status)}`}
                  >
                    {translateStatus(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/50">Ilość sztuk</p>
                    <p className="text-base font-medium text-black">
                      {order.itemCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-black/50">Suma PLN</p>
                    <p className="text-base font-semibold text-black">
                      {order.totalPln.toFixed(2)} zł
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-black/20 text-black/70 hover:bg-black/5"
                >
                  <Link href={`/admin/orders/${order.id}`}>Szczegóły</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
