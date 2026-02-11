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



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Syrenah Store",
    template: "%s | Syrenah",
  },
  description: "Ekskluzywna moda damska - polski design i najwyższa jakość.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <SessionProvider>
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
        </SessionProvider>
      </body>
    </html>
  );
}
