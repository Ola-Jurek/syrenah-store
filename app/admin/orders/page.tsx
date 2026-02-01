"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminToken", token);
}

function promptAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.prompt("Wprowadź token admina:");
  if (token) {
    setAdminToken(token);
    return token;
  }
  return null;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
          localStorage.removeItem("adminToken");
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

  // Filtruj zamówienia po statusie
  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  // Sortuj najnowsze na górze (już powinno być z API, ale na wszelki wypadek)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-black">Zamówienia</h1>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
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

      {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  Ilość sztuk
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  Suma PLN
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-black/50 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black/40">
                    {statusFilter ? `Brak zamówień ze statusem ${translateStatus(statusFilter)}` : "Brak zamówień"}
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="py-4 px-4 text-sm text-black/80">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4 text-sm font-mono text-black/50">
                      {shortenId(order.id)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusClasses(order.status)}`}>
                        {translateStatus(order.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-right text-black/80">{order.itemCount}</td>
                    <td className="py-4 px-4 text-sm text-right font-medium text-black">
                      {order.totalPln.toFixed(2)} zł
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button asChild variant="outline" size="sm" className="border-black/20 text-black/70 hover:bg-black/5">
                        <Link href={`/admin/orders/${order.id}`}>Szczegóły</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-4">
          {sortedOrders.length === 0 ? (
            <div className="text-center text-black/40 py-12">
              {statusFilter ? `Brak zamówień ze statusem ${translateStatus(statusFilter)}` : "Brak zamówień"}
            </div>
          ) : (
            sortedOrders.map((order) => (
              <Card key={order.id} className="border-black/10 bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base mb-1 text-black">
                        {formatDate(order.createdAt)}
                      </CardTitle>
                      <p className="text-xs text-black/50 font-mono">
                        {shortenId(order.id)}
                      </p>
                    </div>
                    <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusClasses(order.status)}`}>
                      {translateStatus(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-black/50">Ilość sztuk</p>
                      <p className="text-base font-medium text-black">{order.itemCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black/50">Suma PLN</p>
                      <p className="text-base font-semibold text-black">
                        {order.totalPln.toFixed(2)} zł
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full border-black/20 text-black/70 hover:bg-black/5">
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

