import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingBag, Folder, Image } from "lucide-react";

export default async function AdminDashboard() {
  // Pobierz statystyki
  const [productCount, orderCount, categoryCount, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "PAID"],
        },
      },
    }),
  ]);

  const menuItems = [
    {
      href: "/admin/orders",
      label: "ZAMÓWIENIA",
      icon: ShoppingBag,
    },
    {
      href: "/admin/products",
      label: "PRODUKTY",
      icon: Package,
    },
    {
      href: "/admin/categories",
      label: "KATEGORIE",
      icon: Folder,
    },
    {
      href: "/admin/hero",
      label: "HERO",
      icon: Image,
    },
  ];

  return (
    <div>
      {/* Powitanie */}
      <h1 className="text-xs uppercase tracking-widest mb-12 text-black font-medium">
        PANEL ZARZĄDZANIA
      </h1>

      {/* Statystyki */}
      <div className="mb-16">
        <h2 className="text-xs uppercase tracking-widest mb-6 text-black/60 font-medium">
          W SKRÓCIE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl font-serif text-[#C1A88C] mb-1">
              {productCount}
            </p>
            <p className="text-xs text-black/60 uppercase tracking-widest">
              Produkty
            </p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#C1A88C] mb-1">
              {orderCount}
            </p>
            <p className="text-xs text-black/60 uppercase tracking-widest">
              Zamówienia
            </p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#C1A88C] mb-1">
              {categoryCount}
            </p>
            <p className="text-xs text-black/60 uppercase tracking-widest">
              Kategorie
            </p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#C1A88C] mb-1">
              {pendingOrders}
            </p>
            <p className="text-xs text-black/60 uppercase tracking-widest">
              Do realizacji
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div>
        <h2 className="text-xs uppercase tracking-widest mb-6 text-black/60 font-medium">
          MENU
        </h2>
        <nav className="flex flex-col gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 text-xs uppercase tracking-widest text-[#C1A88C]/70 hover:text-[#C1A88C] transition-colors group"
              >
                <Icon className="h-4 w-4 text-[#C1A88C]/60 group-hover:text-[#C1A88C] transition-colors" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

