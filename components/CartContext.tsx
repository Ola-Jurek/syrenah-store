"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  slug?: string; // Do linkowania z powrotem do produktu
  categorySlug?: string; // Do linkowania z powrotem do produktu
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;  
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // Sprawdź czy istnieje produkt z tym samym ID, rozmiarem i kolorem
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
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setItems((prev) => {
      // Znajdź konkretny item z tym samym productId, size i color
      const existing = prev.find(
        (item) => 
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );
  
      if (!existing) {
        // Fallback: usuń pierwszy produkt z tym ID (dla kompatybilności wstecznej)
        const fallback = prev.find((item) => item.productId === productId);
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
  
      // jeśli quantity = 1 → usuń produkt
      if (existing.quantity === 1) {
        return prev.filter(
          (item) => 
            !(item.productId === productId &&
              item.size === size &&
              item.color === color)
        );
      }
  
      // jeśli quantity > 1 → odejmij 1
      return prev.map((item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const clearCart = () => {
    console.log("clearCart() called - clearing items and localStorage");
    setItems([]);
    // Bezpośrednie czyszczenie localStorage dla pewności
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
      console.log("localStorage 'cart' key removed");
    }
  };
  
  

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart }}
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
