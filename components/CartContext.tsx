"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";

type CartItem = {
  productId: string;
  name: string;
  /** Cena ostateczna (finalPrice) — to jest kwota, którą klient płaci */
  price: number;
  /** Cena regularna (oryginalna, bez rabatów) — do wyświetlania przekreślonej ceny */
  originalPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  slug?: string;
  categorySlug?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "cart";

// ---------- helpers ----------
function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ---------- Provider ----------
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Śledź poprzedni status sesji (do wykrywania logowania/wylogowania)
  const prevStatusRef = useRef<string | null>(null);
  // Zabezpieczenie przed podwójnym merge
  const mergeInProgressRef = useRef(false);
  // Flaga: czy localStorage jest już załadowany (żeby persist nie nadpisał gościnnego koszyka zanim się załaduje)
  const initializedRef = useRef(false);

  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;

  // ======== Pobierz koszyk z DB (dla zalogowanych) ========
  const fetchDbCart = useCallback(async (): Promise<CartItem[]> => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return [];
      const data = await res.json();
      return data.items ?? [];
    } catch {
      return [];
    }
  }, []);

  // ======== Merge koszyka gościa z DB ========
  const mergeGuestCartToDb = useCallback(async () => {
    if (mergeInProgressRef.current) return;
    mergeInProgressRef.current = true;

    try {
      const guestItems = readGuestCart();
      if (guestItems.length === 0) {
        // Brak elementów gościa — po prostu pobierz koszyk z DB
        const dbItems = await fetchDbCart();
        setItems(dbItems);
        return;
      }

      // Wyślij elementy gościa do merge
      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: guestItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
        // Wyczyść localStorage po udanym merge
        clearGuestCart();
      } else {
        // Fallback — pobierz z DB
        const dbItems = await fetchDbCart();
        setItems(dbItems);
      }
    } catch (error) {
      console.error("Cart merge error:", error);
      // Fallback
      const dbItems = await fetchDbCart();
      setItems(dbItems);
    } finally {
      mergeInProgressRef.current = false;
    }
  }, [fetchDbCart]);

  // ======== Inicjalizacja + reakcja na zmianę sesji ========
  useEffect(() => {
    if (status === "loading") return;

    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "authenticated") {
      // Użytkownik właśnie się zalogował LUB odświeżył stronę jako zalogowany
      if (prevStatus === null || prevStatus === "loading") {
        // Pierwsze załadowanie — merge guest cart
        setIsLoading(true);
        mergeGuestCartToDb().finally(() => setIsLoading(false));
      } else if (prevStatus === "unauthenticated") {
        // Przejście z gościa na zalogowanego — merge
        setIsLoading(true);
        mergeGuestCartToDb().finally(() => setIsLoading(false));
      } else {
        // Już był authenticated — po prostu pobierz koszyk
        setIsLoading(true);
        fetchDbCart().then((dbItems) => {
          setItems(dbItems);
          setIsLoading(false);
        });
      }
    } else if (status === "unauthenticated") {
      if (prevStatus === "authenticated") {
        // Wylogowanie — wyczyść koszyk całkowicie
        setItems([]);
        clearGuestCart();
      } else {
        // Gość — załaduj z localStorage
        const guestItems = readGuestCart();
        setItems(guestItems);
      }
      initializedRef.current = true;
      setIsLoading(false);
    }
  }, [status, mergeGuestCartToDb, fetchDbCart]);

  // ======== Persist do localStorage (tylko dla gości) ========
  useEffect(() => {
    if (!isAuthenticated && initializedRef.current) {
      writeGuestCart(items);
    }
  }, [items, isAuthenticated]);

  // ======== addToCart ========
  const addToCart = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      if (isAuthenticated) {
        // Zalogowany — zapisz do DB
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              quantity: 1,
              size: item.size,
              color: item.color,
            }),
          });

          // Odśwież koszyk z DB
          const dbItems = await fetchDbCart();
          setItems(dbItems);
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      } else {
        // Gość — localStorage
        setItems((prev) => {
          const existing = prev.find(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
          );

          if (existing) {
            return prev.map((i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }

          return [...prev, { ...item, quantity: 1 }];
        });
      }
    },
    [isAuthenticated, fetchDbCart]
  );

  // ======== removeFromCart ========
  const removeFromCart = useCallback(
    async (productId: string, size?: string, color?: string) => {
      if (isAuthenticated) {
        // Zalogowany — usuń z DB
        try {
          const params = new URLSearchParams({ productId });
          if (size) params.set("size", size);
          if (color) params.set("color", color);

          await fetch(`/api/cart?${params.toString()}`, {
            method: "DELETE",
          });

          // Odśwież koszyk z DB
          const dbItems = await fetchDbCart();
          setItems(dbItems);
        } catch (error) {
          console.error("Error removing from cart:", error);
        }
      } else {
        // Gość — localStorage
        setItems((prev) => {
          const existing = prev.find(
            (item) =>
              item.productId === productId &&
              item.size === size &&
              item.color === color
          );

          if (!existing) {
            // Fallback: usuń pierwszy produkt z tym ID
            const fallback = prev.find(
              (item) => item.productId === productId
            );
            if (!fallback) return prev;

            if (fallback.quantity === 1) {
              return prev.filter((item) => item !== fallback);
            }

            return prev.map((item) =>
              item === fallback
                ? { ...item, quantity: item.quantity - 1 }
                : item
            );
          }

          if (existing.quantity === 1) {
            return prev.filter(
              (item) =>
                !(
                  item.productId === productId &&
                  item.size === size &&
                  item.color === color
                )
            );
          }

          return prev.map((item) =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        });
      }
    },
    [isAuthenticated, fetchDbCart]
  );

  // ======== clearCart ========
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      // Usuń wszystkie elementy koszyka z DB
      try {
        // Usuń po jednym — ale lepiej stworzyć dedykowany endpoint lub po prostu wyczyść stan
        // Dla prostoty czyścimy stan i localStorage
        const currentItems = [...items];
        for (const item of currentItems) {
          const params = new URLSearchParams({
            productId: item.productId,
            removeAll: "true",
          });
          if (item.size) params.set("size", item.size);
          if (item.color) params.set("color", item.color);

          await fetch(`/api/cart?${params.toString()}`, {
            method: "DELETE",
          });
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }

    setItems([]);
    clearGuestCart();
  }, [isAuthenticated, items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
