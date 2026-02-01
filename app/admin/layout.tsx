"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { href: "/admin/orders", label: "Zamówienia" },
    { href: "/admin/products", label: "Produkty" },
    { href: "/admin/categories", label: "Kategorie" },
    { href: "/admin/hero", label: "Hero" },
  ];

  // Generuj breadcrumbs na podstawie pathname
  const getBreadcrumbs = () => {
    if (pathname === "/admin") {
      return [];
    }

    const parts = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ href: string; label: string }> = [];

    // Mapuj ścieżki na czytelne nazwy
    const pathMap: Record<string, string> = {
      admin: "ADMIN",
      orders: "ZAMÓWIENIA",
      products: "PRODUKTY",
      categories: "KATEGORIE",
      hero: "HERO",
      edit: "EDYCJA",
      new: "NOWY",
    };

    // Zbuduj ścieżkę kumulatywnie
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += `/${part}`;
      
      const label = pathMap[part] || part.toUpperCase();
      const isLast = i === parts.length - 1;
      
      breadcrumbs.push({
        href: isLast ? pathname : currentPath, // Ostatni element linkuje do obecnej strony
        label,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-black/10 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/admin"
                className="text-sm font-serif text-black/80 tracking-wide hover:text-black transition-colors"
              >
                SYRENAH | Admin
              </Link>
              <Link
                href="/"
                className="text-xs text-black/40 hover:text-black/60 transition-colors"
              >
                ← Sklep
              </Link>
            </div>
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors relative",
                      isActive
                        ? "text-black font-medium"
                        : "text-black/60 hover:text-black"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs - ukryj na głównej stronie /admin */}
      {isMounted && pathname !== "/admin" && breadcrumbs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-black/5">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={index} className="flex items-center gap-2">
                  {isLast ? (
                    // Ostatni element - zawsze linkiem dla spójności
                    <Link
                      href={crumb.href}
                      className="text-[#C1A88C] hover:text-black transition-colors"
                      suppressHydrationWarning
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    // Wszystkie inne elementy - klikalne linki
                    <Link
                      href={crumb.href}
                      className="text-[#C1A88C]/60 hover:text-black transition-colors"
                      suppressHydrationWarning
                    >
                      {crumb.label}
                    </Link>
                  )}
                  {!isLast && (
                    <span className="text-[#C1A88C]/40" suppressHydrationWarning>
                      |
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

