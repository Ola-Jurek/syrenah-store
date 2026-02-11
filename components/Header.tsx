"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, User, Heart, ShoppingBag, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/CartContext"
import { useSession } from "next-auth/react"

type Category = {
  id: string
  namePl: string
  nameEn: string
  slug: string
}

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/shop", labelKey: "shop" },
  { href: "/about", labelKey: "about" },
]

const translations = {
  PL: {
    home: "START",
    shop: "SKLEP",
    collections: "KOLEKCJE",
    about: "O NAS",
    contact: "KONTAKT",
    searchPlaceholder: "SZUKAJ...",
    categories: "KATEGORIE",
  },
  EN: {
    home: "HOME",
    shop: "SHOP",
    collections: "COLLECTIONS",
    about: "ABOUT",
    contact: "CONTACT",
    searchPlaceholder: "SEARCH...",
    categories: "CATEGORIES",
  },
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState<"PL" | "EN">("PL")
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [shopAccordionOpen, setShopAccordionOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession();
  const { items } = useCart();
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Fetch categories for the mobile accordion
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
      
      // Określ kierunek scrollowania
      if (currentScrollY === 0) {
        // Na górze - zawsze widoczny
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scroll w dół - ukryj
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scroll w górę - pokaż
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
      setScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const isAtTop = scrollY === 0

  const toggleLanguage = () => {
    setLanguage(language === "PL" ? "EN" : "PL")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
      setSearchQuery("")
    }
  }

  // Ukryj Header na stronach admina
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

          {/* Left Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
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
                {translations[language][link.labelKey as keyof typeof translations.PL]}
              </Link>
            ))}
          </nav>

          {/* LEFT SIDE – Mobile: [Hamburger] */}
          <div className="flex md:hidden items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative z-50"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu główne</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col flex-1 mt-6 px-10">
                  {/* Language Switcher - na górze */}
                  <div className="flex items-center gap-2 pb-6 border-b border-[#C1A88C]/10">
                    <button
                      onClick={toggleLanguage}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C1A88C] font-medium"
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          language === "PL"
                            ? "text-[#C1A88C]"
                            : "text-[#C1A88C]/40"
                        )}
                      >
                        PL
                      </span>
                      <span className="text-[#C1A88C]/20">|</span>
                      <span
                        className={cn(
                          "transition-colors",
                          language === "EN"
                            ? "text-[#C1A88C]"
                            : "text-[#C1A88C]/40"
                        )}
                      >
                        EN
                      </span>
                    </button>
                  </div>

                  {/* Wyszukiwarka */}
                  <form onSubmit={handleSearch} className="py-6">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-[#C1A88C] flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={translations[language].searchPlaceholder}
                        className="flex-1 bg-transparent border-none outline-none text-[#C1A88C] placeholder:text-[#C1A88C]/40 text-xs uppercase tracking-widest focus:outline-none"
                      />
                    </div>
                  </form>

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-4">
                    {/* SKLEP as accordion */}
                    <div>
                      <button
                        onClick={() => setShopAccordionOpen(!shopAccordionOpen)}
                        className={cn(
                          "flex items-center gap-2 text-xs uppercase tracking-widest font-medium transition-colors text-[#C1A88C] hover:text-[#C1A88C]/80 w-full text-left",
                          pathname?.startsWith("/shop")
                            ? "text-[#C1A88C]"
                            : "text-[#C1A88C]/70"
                        )}
                      >
                        {translations[language].shop}
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform duration-200",
                            shopAccordionOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Accordion content - categories */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          shopAccordionOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="flex flex-col gap-3 pl-4 border-l border-[#C1A88C]/10">
                          {/* Link do wszystkich produktów */}
                          <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "text-xs uppercase tracking-widest transition-colors",
                              pathname === "/shop"
                                ? "text-[#C1A88C] font-medium"
                                : "text-[#C1A88C]/50 hover:text-[#C1A88C]/80"
                            )}
                          >
                            {translations[language].categories}
                          </Link>
                          {/* Category links */}
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/shop/${cat.slug}`}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "text-xs uppercase tracking-widest transition-colors",
                                pathname === `/shop/${cat.slug}`
                                  ? "text-[#C1A88C] font-medium"
                                  : "text-[#C1A88C]/50 hover:text-[#C1A88C]/80"
                              )}
                            >
                              {language === "PL" ? cat.namePl.toUpperCase() : cat.nameEn.toUpperCase()}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* O NAS link */}
                    <Link
                      href="/o-nas"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-xs uppercase tracking-widest font-medium transition-colors text-[#C1A88C] hover:text-[#C1A88C]/80",
                        pathname === "/about"
                          ? "text-[#C1A88C]"
                          : "text-[#C1A88C]/70"
                      )}
                    >
                      {translations[language].about}
                    </Link>
                  </nav>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Konto – na samym dole menu mobilnego */}
                  <div className="pt-6 pb-8 border-t border-[#C1A88C]/10">
                    <Link
                      href={session ? "/account" : "/login"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-xs uppercase tracking-widest font-medium text-[#C1A88C]/70 hover:text-[#C1A88C] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {session ? "Moje konto" : "Zaloguj"}
                    </Link>
                  </div>
                </div>
              </SheetContent>

            </Sheet>
          </div>

          {/* PERFECTLY CENTERED LOGO */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          >
            <img
              src="/SYRENAH_logo_napis.png"
              alt="Syrenah Logo"
              className="h-5 md:h-7 w-auto object-contain"
            />
          </Link>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-0.5 md:gap-3">

            {/* Desktop Language Switch */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                <span
                  className={cn(
                    language === "PL"
                      ? "text-foreground"
                      : "text-foreground/40"
                  )}
                >
                  PL
                </span>
                <span className="text-foreground/20">|</span>
                <span
                  className={cn(
                    language === "EN"
                      ? "text-foreground"
                      : "text-foreground/40"
                  )}
                >
                  EN
                </span>
              </button>
            </div>

            {/* Icons – Mobile: [Ulubione] [Koszyk] / Desktop: [Ulubione] [Koszyk] [Konto] */}

              {/* Wishlist – always visible */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10" aria-label="Ulubione">
                  <Heart className="h-[18px] w-[18px] md:h-5 md:w-5" />
                </Button>
              </Link>

              {/* Cart – always visible */}
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10" aria-label="Koszyk">
                  <ShoppingBag className="h-[18px] w-[18px] md:h-5 md:w-5" />
                </Button>

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-black text-white text-xs flex items-center justify-center px-1">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Account – only desktop (on mobile it's next to hamburger) */}
              <Link href="/account" className="hidden md:flex">
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Konto">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

            

          </div>
        </div>
      </div>
    </header>
  )
}
