"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

type WishlistContextType = {
  productIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
};

const WishlistContext = createContext<WishlistContextType>({
  productIds: [],
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  isLoading: false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pobierz wishlistę po zalogowaniu
  useEffect(() => {
    if (status !== "authenticated") {
      setProductIds([]);
      return;
    }

    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setProductIds(data.productIds || []);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    }

    fetchWishlist();
  }, [status]);

  const isInWishlist = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (status !== "authenticated") return;

      // Optimistic update
      setProductIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) {
          // Cofnij optimistic update
          setProductIds((prev) =>
            prev.includes(productId)
              ? prev.filter((id) => id !== productId)
              : [...prev, productId]
          );
        }
      } catch {
        // Cofnij optimistic update
        setProductIds((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      }
    },
    [status]
  );

  return (
    <WishlistContext.Provider
      value={{ productIds, isInWishlist, toggleWishlist, isLoading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
