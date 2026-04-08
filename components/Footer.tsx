"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";


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

          {/* Column 2: Social */}
            <div className="flex flex-col space-y-3 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
                Social
            </span>

            <a 
                href="https://www.instagram.com/syrenah_the_label?igsh=MWJmZmdkbzVmcnY2Zg%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
                aria-label="Instagram Syrenah"
            >
                <Instagram className="h-5 w-5" />
            </a>

            <a 
                href="https://www.tiktok.com/@syrenah_the_label?_r=1&_t=ZN-94UxeTae7TK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
                aria-label="TikTok Syrenah"
            >
                <TikTokIcon className="h-5 w-5" />
            </a>

            </div>


          {/* Column 3: Dane sklepu */}
          <div className="flex flex-col space-y-2 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              Dane sklepu
            </span>
            <p className="text-sm text-foreground/70">Syrenah</p>
            <p className="text-sm text-foreground/70">info@syrenahthelabel.com</p>
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

