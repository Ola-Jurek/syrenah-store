"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    clearCart();
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pokaż ładowanie dopóki sprawdzamy sesję
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
      </div>
    );
  }

  // Brak uprawnień — elegancka strona blokady
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    const isLoggedIn = status === "authenticated";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
        <div className="w-full max-w-xs text-center">
          {/* Ikona kłódki */}
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full border border-[#E8E3D8] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-400"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <h1 className="text-sm font-serif text-neutral-700 tracking-wider mb-2">
            Panel Administracyjny
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed mb-8">
            Dostęp do tej sekcji wymaga uprawnień administratora.
          </p>

          {/* Informacja o zalogowanym użytkowniku bez uprawnień */}
          {isLoggedIn && (
            <p className="text-xs text-neutral-400 mb-6">
              Zalogowano jako {session?.user?.email}. Brak uprawnień.
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-8 py-2.5 text-xs uppercase tracking-widest border border-[#E8E3D8] bg-transparent text-neutral-600 hover:bg-[#E8E3D8] hover:text-neutral-800 transition-colors"
            >
              Wróć do sklepu
            </Link>

            {!isLoggedIn && (
              <Link
                href="/login?callbackUrl=/admin"
                className="w-full inline-flex items-center justify-center px-8 py-2.5 text-xs uppercase tracking-widest bg-[#E8E3D8] text-neutral-700 hover:bg-[#DDD7C8] transition-colors"
              >
                Zaloguj się jako administrator
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/orders", label: "Zamówienia" },
    { href: "/admin/products", label: "Produkty" },
    { href: "/admin/categories", label: "Kategorie" },
    { href: "/admin/discounts", label: "Rabaty" },
    { href: "/admin/hero", label: "Hero" },
    { href: "/admin/newsletter", label: "Newsletter" },
    { href: "/admin/instagram", label: "Instagram" },
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
      discounts: "RABATY",
      hero: "HERO",
      newsletter: "NEWSLETTER",
      instagram: "INSTAGRAM",
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
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-[#E8E3D8]/60 bg-[#FDFBF7]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 md:mb-3">
              <Link
                href="/admin"
                className="min-w-0 truncate text-sm font-serif tracking-wide text-neutral-700 transition-colors hover:text-neutral-900"
              >
                SYRENAH | Admin
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href="/"
                  className="text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  ← Sklep
                </Link>
                <span className="h-4 w-px bg-[#E8E3D8]" />
                <button
                  onClick={handleSignOut}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Wyloguj</span>
                </button>
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center text-[#3d2e24] md:hidden"
                      aria-label="Otwórz menu"
                    >
                      <Menu size={20} strokeWidth={1.5} />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[260px] border-[#E8E3D8] bg-[#FDFBF7] p-0"
                  >
                    <SheetHeader className="border-b border-[#E8E3D8] px-5 py-4 text-left">
                      <SheetTitle className="font-serif text-sm font-normal tracking-wide text-neutral-700">
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col px-2 py-2">
                      {navLinks.map((link) => {
                        const isActive =
                          pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "px-3 py-3 text-sm transition-colors",
                              isActive
                                ? "font-medium text-neutral-800"
                                : "text-neutral-500 hover:text-neutral-800"
                            )}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <nav className="hidden flex-wrap items-center gap-x-4 gap-y-1 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative w-fit py-1 text-sm transition-colors",
                      isActive
                        ? "font-medium text-neutral-800"
                        : "text-neutral-500 hover:text-neutral-800"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-0 right-0 h-px bg-[#C1A88C]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Breadcrumbs - ukryj na głównej stronie /admin */}
      {isMounted && pathname !== "/admin" && breadcrumbs.length > 0 && (
        <div className="mx-auto max-w-7xl overflow-x-auto border-b border-black/5 px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex w-max min-w-full items-center gap-2 text-xs uppercase tracking-widest">
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
      <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
