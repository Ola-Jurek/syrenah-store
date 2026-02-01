"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, User, Heart, ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/CartContext"
 

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
  },
  EN: {
    home: "HOME",
    shop: "SHOP",
    collections: "COLLECTIONS",
    about: "ABOUT",
    contact: "CONTACT",
    searchPlaceholder: "SEARCH...",
  },
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState<"PL" | "EN">("PL")
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart();
const totalItems = items.reduce(
  (sum, item) => sum + item.quantity,
  0
);

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

          {/* MOBILE MENU */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden relative z-50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu główne</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-8 mt-6 px-10">
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
                <form onSubmit={handleSearch} className="pb-6">
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-xs uppercase tracking-widest font-medium transition-colors text-[#C1A88C] hover:text-[#C1A88C]/80",
                        pathname === link.href
                          ? "text-[#C1A88C]"
                          : "text-[#C1A88C]/70"
                      )}
                    >
                      {translations[language][link.labelKey as keyof typeof translations.PL]}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>

          </Sheet>

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
          <div className="flex items-center gap-2 md:gap-4">

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

            {/* Icons */}
            
              {/* /* Wishlist – only desktop */ }
              <Link href="/wishlist" className="hidden sm:flex">
                <Button variant="ghost" size="icon" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* /* Cart – always visible */ }
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" aria-label="Shopping cart">
                  <ShoppingBag className="h-5 w-5" />
                </Button>

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-black text-white text-xs flex items-center justify-center px-1">
                    {totalItems}
                  </span>
                )}
              </Link>


              {/* /* Account – always visible */ }
              <Link href="/account">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

            

          </div>
        </div>
      </div>
    </header>
  )
}

