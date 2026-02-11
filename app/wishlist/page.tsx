"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";

type WishlistProduct = {
  id: string;
  productId: string;
  product: {
    id: string;
    namePl: string;
    nameEn: string;
    slug: string;
    pricePln: string;
    priceEur: string;
    image: string | null;
    imageAlt: string;
    categorySlug: string;
    categoryName: string;
  };
  createdAt: string;
};

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toggleWishlist } = useWishlist();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status !== "authenticated") return;

    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [status, router]);

  const handleRemove = async (productId: string) => {
    // Optimistic UI
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    await toggleWishlist(productId);
  };

  if (status === "loading" || loading) {
    return (
      <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
        <div className="text-center py-24">
          <p className="text-sm text-black/40 tracking-widest uppercase">
            Ładowanie...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
      {/* Breadcrumbs */}
      <nav className="mb-16">
        <div className="flex items-center gap-2 text-xs text-[#C1A88C]/60">
          <Link href="/" className="hover:text-[#C1A88C] transition-colors">
            START
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <span className="text-[#C1A88C]/60">ULUBIONE</span>
        </div>
      </nav>

      <div className="flex items-center gap-3 mb-12">
        <Heart className="h-5 w-5 text-[#C1A88C] fill-[#C1A88C]" />
        <h1 className="text-xs uppercase tracking-widest font-serif text-black font-medium">
          ULUBIONE
        </h1>
        <span className="text-xs text-black/40">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 space-y-6">
          <Heart className="h-12 w-12 mx-auto text-[#C1A88C]/30" />
          <p className="text-sm text-black/50 tracking-wide">
            Twoja lista ulubionych jest pusta
          </p>
          <Link
            href="/shop"
            className="inline-block border border-[#C1A88C] text-[#C1A88C] px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#C1A88C] hover:text-white transition-all"
          >
            Odkryj produkty
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              {/* Przycisk usuwania */}
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-2 right-2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                aria-label="Usuń z ulubionych"
              >
                <Trash2 className="h-4 w-4 text-black/40 hover:text-red-500 transition-colors" />
              </button>

              <Link
                href={`/shop/${item.product.categorySlug}/${item.product.slug}`}
              >
                <div className="bg-[#C1A88C]/10 aspect-[3/4] relative mb-3 overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Syrenah"
                        width={80}
                        height={80}
                        className="opacity-20"
                      />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-sm uppercase tracking-widest font-serif text-black mb-1">
                    {item.product.namePl.toUpperCase()}
                  </h2>
                  <p className="text-xs text-black/40 mb-1">
                    {item.product.categoryName}
                  </p>
                  <p className="text-xs text-black/60">
                    {item.product.pricePln} PLN
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
