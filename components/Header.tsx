"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User, Heart, ShoppingBag, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/CartContext"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/LanguageContext"
import { HeaderSearch } from "@/components/HeaderSearch"

type Category = {
  id: string
  namePl: string
  nameEn: string
  slug: string
}

const navLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/shop", labelKey: "nav.shop" },
  { href: "/o-nas", labelKey: "nav.about" },
]

export function Header() {
  const { locale, setLocale, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [shopAccordionOpen, setShopAccordionOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()
  const { data: session } = useSession();
  const { items } = useCart();
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories)
        }
      } catch (err) {
        console.error("Failed to fetch categories", err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY === 0) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
      setScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const isAtTop = scrollY === 0

  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-500 ease-in-out",
      isVisible ? "translate-y-0" : "-translate-y-full",
      isAtTop
        ? "bg-white border-border/40"
        : "bg-white/20 backdrop-blur-2xl border-white/10"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                suppressHydrationWarning={true}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex lg:hidden items-center gap-0.5">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative z-50"
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">{t("nav.mobileMenuTitle")}</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col flex-1 mt-6 px-10">
                  <div className="flex items-center gap-2 pb-6 border-b border-[#5c4433]/15">
                    <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[#5c4433] font-medium">
                      <button
                        type="button"
                        onClick={() => setLocale("pl")}
                        className={cn(
                          "transition-colors",
                          locale === "pl"
                            ? "text-[#3d2e24]"
                            : "text-[#3d2e24]/45"
                        )}
                      >
                        PL
                      </button>
                      <span className="text-[#3d2e24]/25">|</span>
                      <button
                        type="button"
                        onClick={() => setLocale("en")}
                        className={cn(
                          "transition-colors",
                          locale === "en"
                            ? "text-[#3d2e24]"
                            : "text-[#3d2e24]/45"
                        )}
                      >
                        EN
                      </button>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-4 pt-6">
                    <div>
                      <button
                        type="button"
                        onClick={() => setShopAccordionOpen(!shopAccordionOpen)}
                        className={cn(
                          "flex items-center gap-2 text-[13px] uppercase tracking-widest font-medium transition-colors text-[#4a392d] hover:text-[#3d2e24] w-full text-left",
                          pathname?.startsWith("/shop")
                            ? "text-[#3d2e24]"
                            : "text-[#4a392d]/90"
                        )}
                      >
                        {t("nav.shop")}
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 text-[#4a392d] transition-transform duration-200",
                            shopAccordionOpen && "rotate-180"
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          shopAccordionOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="flex flex-col gap-3 pl-4 border-l border-[#5c4433]/15">
                          <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "text-[13px] uppercase tracking-widest transition-colors",
                              pathname === "/shop"
                                ? "text-[#3d2e24] font-medium"
                                : "text-[#4a392d]/65 hover:text-[#3d2e24]"
                            )}
                          >
                            {t("nav.categories")}
                          </Link>
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/shop/${cat.slug}`}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "text-[13px] uppercase tracking-widest transition-colors",
                                pathname === `/shop/${cat.slug}`
                                  ? "text-[#3d2e24] font-medium"
                                  : "text-[#4a392d]/65 hover:text-[#3d2e24]"
                              )}
                            >
                              {locale === "pl" ? cat.namePl.toUpperCase() : cat.nameEn.toUpperCase()}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/o-nas"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-[13px] uppercase tracking-widest font-medium transition-colors text-[#4a392d] hover:text-[#3d2e24]",
                        pathname === "/o-nas"
                          ? "text-[#3d2e24]"
                          : "text-[#4a392d]/90"
                      )}
                    >
                      {t("nav.about")}
                    </Link>
                  </nav>

                  <div className="flex-1" />

                  <div className="pt-6 pb-8 border-t border-[#5c4433]/15">
                    <Link
                      href={session ? "/account" : "/login"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-[13px] uppercase tracking-widest font-medium text-[#4a392d]/90 hover:text-[#3d2e24] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {session ? t("nav.myAccount") : t("nav.login")}
                    </Link>
                  </div>
                </div>
              </SheetContent>

            </Sheet>

            <HeaderSearch variant="mobile" />
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          >
            <img
              src="/SYRENAH_logo_napis.png"
              alt={t("nav.logoAlt")}
              className="h-5 md:h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-0.5 lg:gap-3">

            <div className="hidden lg:flex items-center gap-2 mr-2">
              <HeaderSearch variant="desktop" />
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
                <button
                  type="button"
                  onClick={() => setLocale("pl")}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    locale === "pl"
                      ? "text-foreground"
                      : "text-foreground/40"
                  )}
                >
                  PL
                </button>
                <span className="text-foreground/20">|</span>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    locale === "en"
                      ? "text-foreground"
                      : "text-foreground/40"
                  )}
                >
                  EN
                </button>
              </div>
            </div>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10" aria-label={t("nav.wishlistAria")}>
                <Heart className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10" aria-label={t("nav.cartAria")}>
                <ShoppingBag className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </Button>

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-black text-white text-xs flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link href="/account" className="hidden lg:flex">
              <Button variant="ghost" size="icon" className="h-10 w-10" aria-label={t("nav.accountAria")}>
                <User className="h-5 w-5" />
              </Button>
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}
