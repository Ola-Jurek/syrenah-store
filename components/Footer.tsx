"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useLanguage } from "@/components/LanguageContext";


export function Footer() {
  const pathname = usePathname()
  const { t } = useLanguage()

  if (pathname?.startsWith("/admin")) {
    return null
  }
  const footerSpacing =
    pathname === "/"
      ? "mt-0 pt-16"
      : pathname === "/zwroty-i-reklamacje"
        ? "mt-0 pt-8"
        : "mt-24 pt-16"

  return (
    <footer className={`w-full border-t border-border/20 bg-background pb-12 ${footerSpacing}`}>
      <div className="container mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16">

          <div className="flex flex-col space-y-2 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              {t("footer.info")}
            </span>
            <Link href="/o-nas" className="text-sm text-foreground/70 hover:text-foreground transition">
              {t("footer.about")}
            </Link>
            <Link href="/kontakt" className="text-sm text-foreground/70 hover:text-foreground transition">
              {t("footer.contact")}
            </Link>
            <Link href="/regulamin" className="text-sm text-foreground/70 hover:text-foreground transition">
              {t("footer.terms")}
            </Link>
            <Link href="/polityka-prywatnosci" className="text-sm text-foreground/70 hover:text-foreground transition">
              {t("footer.privacy")}
            </Link>
            <Link href="/zwroty-i-reklamacje" className="text-sm text-foreground/70 hover:text-foreground transition">
              {t("footer.returns")}
            </Link>
          </div>

          <div className="flex flex-col space-y-3 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              {t("footer.social")}
            </span>

            <a
              href="https://www.instagram.com/syrenah_the_label/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
              aria-label={t("footer.instagramAria")}
            >
              <Instagram className="h-5 w-5" />
            </a>

            <a
              href="https://www.tiktok.com/@syrenah_the_label"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
              aria-label={t("footer.tiktokAria")}
            >
              <TikTokIcon className="h-5 w-5" />
            </a>

          </div>


          <div className="flex flex-col space-y-2 items-center">
            <span className="text-xs tracking-wider text-foreground/60 uppercase">
              {t("footer.shopData")}
            </span>
            <p className="text-sm text-foreground/70">Syrenah</p>
            <p className="text-sm text-foreground/70">info@syrenahthelabel.com</p>
          </div>
        </div>

        <div className="text-center text-xs text-foreground/50 tracking-wide">
          © {new Date().getFullYear()} Syrenah. {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
