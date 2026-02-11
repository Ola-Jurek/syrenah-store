"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User, Package, LogOut, Pencil, X, Check, ChevronRight } from "lucide-react";
import { useCart } from "@/components/CartContext";

// ── Types ──────────────────────────────────────────────

interface OrderItem {
  id: string;
  quantity: number;
  pricePln: string;
  product: {
    namePl: string;
    slug: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalPln: string;
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: {
    id: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

type Tab = "account" | "orders" | "logout";

// ── Status Maps ────────────────────────────────────────

const statusLabels: Record<string, string> = {
  PENDING: "Oczekujące",
  PAID: "Opłacone",
  PROCESSING: "W realizacji",
  SHIPPED: "Wysłane",
  DELIVERED: "Dostarczone",
  CANCELLED: "Anulowane",
  FAILED: "Nieudane",
  REFUNDED: "Zwrócone",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-sky-50 text-sky-700 border-sky-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
  REFUNDED: "bg-orange-50 text-orange-600 border-orange-200",
};

// ── Component ──────────────────────────────────────────

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { clearCart } = useCart();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Edit mode ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    lastName: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Sign out ──
  const handleSignOut = useCallback(async () => {
    clearCart();
    await signOut({ callbackUrl: "/" });
  }, [clearCart]);

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Błąd pobierania profilu:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Błąd pobierania zamówień:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Auth guard ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ── Load data ──
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
      fetchOrders();
    }
  }, [status, fetchProfile, fetchOrders]);

  // ── Start editing ──
  const startEditing = () => {
    setEditForm({
      name: profile?.name || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      street: profile?.address?.street || "",
      postalCode: profile?.address?.postalCode || "",
      city: profile?.address?.city || "",
    });
    setIsEditing(true);
  };

  // ── Cancel editing ──
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // ── Save profile ──
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          lastName: editForm.lastName,
          phone: editForm.phone,
          address: {
            street: editForm.street,
            postalCode: editForm.postalCode,
            city: editForm.city,
            country: "Polska",
          },
        }),
      });

      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Błąd zapisywania:", error);
    } finally {
      setSaving(false);
    }
  };

  // ── Handle tab change ──
  const handleTabChange = (tab: Tab) => {
    if (tab === "logout") {
      handleSignOut();
      return;
    }
    setActiveTab(tab);
  };

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-5 h-5 border-2 border-[#E8E3D8] border-t-[#C1A88C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const firstName = profile?.name || session.user?.name || "";

  // ── Tabs config ──
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: "Dane konta", icon: <User className="h-4 w-4" /> },
    { key: "orders", label: "Zamówienia", icon: <Package className="h-4 w-4" /> },
    { key: "logout", label: "Wyloguj", icon: <LogOut className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Nagłówek z imieniem ── */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-800 tracking-wide">
            Cześć, {firstName || "Klientko"}!
          </h1>
          <div className="mt-3 w-12 h-px bg-[#C1A88C]" />
        </div>

        {/* ── System zakładek ── */}
        <div className="flex border-b border-[#E8E3D8] mb-10 gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-widest font-medium transition-all duration-200 cursor-pointer
                border-b-2 -mb-px
                ${
                  activeTab === tab.key && tab.key !== "logout"
                    ? "border-[#C1A88C] text-neutral-800 bg-[#C1A88C]/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-600 hover:border-[#E8E3D8]"
                }
                ${tab.key === "logout" ? "ml-auto text-neutral-400 hover:text-red-500" : ""}
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Zakładka: Dane konta ── */}
        {activeTab === "account" && (
          <div className="animate-in fade-in duration-300">
            {profileLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-5 h-5 border-2 border-[#E8E3D8] border-t-[#C1A88C] rounded-full animate-spin" />
              </div>
            ) : isEditing ? (
              /* ── Tryb edycji ── */
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Edytuj dane
                  </h2>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Anuluj
                  </button>
                </div>

                <div className="border border-[#E8E3D8] bg-white p-8 space-y-6">
                  {/* Imię i Nazwisko */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                        Imię
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                        placeholder="Imię"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                        Nazwisko
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                        placeholder="Nazwisko"
                      />
                    </div>
                  </div>

                  {/* Email (read only) */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full border border-[#E8E3D8] bg-neutral-50 px-4 py-3 text-sm text-neutral-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                      placeholder="+48 000 000 000"
                    />
                  </div>

                  {/* Separator */}
                  <div className="border-t border-[#E8E3D8]" />

                  {/* Adres */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                      Ulica i numer
                    </label>
                    <input
                      type="text"
                      value={editForm.street}
                      onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                      className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                      placeholder="ul. Przykładowa 10/5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                        Kod pocztowy
                      </label>
                      <input
                        type="text"
                        value={editForm.postalCode}
                        onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                        className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                        placeholder="00-000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
                        Miasto
                      </label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full border border-[#E8E3D8] bg-[#FDFBF7] px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#C1A88C] transition-colors"
                        placeholder="Warszawa"
                      />
                    </div>
                  </div>
                </div>

                {/* Przycisk zapisz */}
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#C1A88C] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#B09878] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Zapisz zmiany
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ── Tryb wyświetlania ── */
              <div className="space-y-8">
                <div className="border border-[#E8E3D8] bg-white p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-12">
                    {/* Imię */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
                        Imię
                      </span>
                      <p className="text-sm text-neutral-700">
                        {profile?.name || <span className="text-neutral-300 italic">—</span>}
                      </p>
                    </div>

                    {/* Nazwisko */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
                        Nazwisko
                      </span>
                      <p className="text-sm text-neutral-700">
                        {profile?.lastName || <span className="text-neutral-300 italic">—</span>}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
                        Email
                      </span>
                      <p className="text-sm text-neutral-700">
                        {profile?.email}
                      </p>
                    </div>

                    {/* Telefon */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
                        Numer telefonu
                      </span>
                      <p className="text-sm text-neutral-700">
                        {profile?.phone || <span className="text-neutral-300 italic">—</span>}
                      </p>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-[#E8E3D8] my-7" />

                  {/* Adres */}
                  <div>
                    <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
                      Adres
                    </span>
                    {profile?.address ? (
                      <div className="text-sm text-neutral-700 space-y-0.5">
                        <p>{profile.address.street}</p>
                        <p>{profile.address.postalCode} {profile.address.city}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-300 italic">Brak adresu</p>
                    )}
                  </div>
                </div>

                {/* Przycisk edytuj */}
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2 px-6 py-3 border border-[#C1A88C] text-[#C1A88C] text-xs uppercase tracking-widest font-medium hover:bg-[#C1A88C] hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edytuj dane
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Zakładka: Zamówienia ── */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in duration-300">
            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-5 h-5 border-2 border-[#E8E3D8] border-t-[#C1A88C] rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#E8E3D8] bg-white p-12 text-center">
                <Package className="h-10 w-10 text-neutral-200 mx-auto mb-4" />
                <p className="text-sm text-neutral-400 mb-6">
                  Nie masz jeszcze żadnych zamówień.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C1A88C] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#B09878] transition-colors"
                >
                  Przejdź do sklepu
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="group block border border-[#E8E3D8] bg-white p-6 hover:border-[#C1A88C]/40 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-neutral-700 tracking-wide">
                          Zamówienie #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-medium px-3 py-1.5 border ${
                            statusColors[order.status] ||
                            "bg-neutral-50 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                        <span className="text-sm font-medium text-neutral-700 whitespace-nowrap tabular-nums">
                          {Number(order.totalPln).toFixed(2)} zł
                        </span>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-[#C1A88C] transition-colors hidden sm:block" />
                      </div>
                    </div>

                    {order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#E8E3D8]/60">
                        <p className="text-xs text-neutral-400">
                          {order.items
                            .map(
                              (item) =>
                                `${item.product.namePl} × ${item.quantity}`
                            )
                            .join("  ·  ")}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
