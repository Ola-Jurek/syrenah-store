"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook } from "lucide-react";


export function Footer() {
  const pathname = usePathname()

  // Ukryj Footer na stronach admina
  if (pathname?.startsWith("/admin")) {
    return null
  }
  return (
    <footer className="w-full border-t border-border/20 mt-24 pt-16 pb-12 bg-background">
      <div className="container mx-auto px-6">
        
        {/* GRID - centered like Sober */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16">
          
          {/* Column 1: Informacje */}
          <div className="flex flex-col space-y-2 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              Informacje
            </span>
            <Link href="/o-nas" className="text-sm text-foreground/70 hover:text-foreground transition">
              O nas
            </Link>
            <Link href="/kontakt" className="text-sm text-foreground/70 hover:text-foreground transition">
              Kontakt
            </Link>
            <Link href="/regulamin" className="text-sm text-foreground/70 hover:text-foreground transition">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="text-sm text-foreground/70 hover:text-foreground transition">
              Polityka prywatności
            </Link>
            <Link href="/zwroty-i-reklamacje" className="text-sm text-foreground/70 hover:text-foreground transition">
              Zwroty i reklamacje
            </Link>
          </div>

          {/* Column 2: Social (Instagram, Facebook, Pinterest) */}
            <div className="flex flex-col space-y-3 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
                Social
            </span>

            <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
                <Instagram className="h-5 w-5" />
                
            </a>

            <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
                <Facebook className="h-5 w-5" />
                
            </a>

            </div>


          {/* Column 3: Dane sklepu */}
          <div className="flex flex-col space-y-2 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              Dane sklepu
            </span>
            <p className="text-sm text-foreground/70">Syrenah The Label</p>
            <p className="text-sm text-foreground/70">contact@syrenah.com</p>
          </div>
        </div>

        {/* COPYRIGHT CENTERED */}
        <div className="text-center text-xs text-foreground/50 tracking-wide">
          © {new Date().getFullYear()} Syrenah. Wszystkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}

