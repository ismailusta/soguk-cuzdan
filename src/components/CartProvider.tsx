"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart as addItem,
  cartCount,
  clearCart as clear,
  getCart,
  removeFromCart as removeItem,
  setQuantity as setQty,
} from "@/lib/cart";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    setItems(getCart());
  }, []);

  useEffect(() => {
    sync();
    setReady(true);
    const onUpdate = () => sync();
    window.addEventListener("cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [sync]);

  const value: CartContextValue = {
    items,
    count: cartCount(items),
    ready,
    add: (productId, quantity = 1) => setItems(addItem(productId, quantity)),
    setQuantity: (productId, quantity) => setItems(setQty(productId, quantity)),
    remove: (productId) => setItems(removeItem(productId)),
    clear: () => {
      clear();
      setItems([]);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
