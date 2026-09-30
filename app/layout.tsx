import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/fonts.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "./PageTransition";
import { CartProvider } from "@/components/CartContext";
import { SessionProvider } from "@/components/SessionProvider";
import { WishlistProvider } from "@/components/WishlistContext";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { CookieBanner } from "@/components/CookieBanner";
import { LanguageProvider } from "@/components/LanguageContext";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://syrenahthelabel.com";
const siteDescription =
  "Ekskluzywna moda damska - polski design i najwyższa jakość.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Syrenah Store",
    template: "%s | Syrenah",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: siteUrl,
    siteName: "Syrenah",
    title: "Syrenah Store",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              name: "Syrenah",
              url: siteUrl,
              logo: `${siteUrl}/icon-192.png`,
              description: siteDescription,
            }),
          }}
        />
        <SessionProvider>
          <LanguageProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
                <CookieBanner />
                <NewsletterPopup />
              </WishlistProvider>
            </CartProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
