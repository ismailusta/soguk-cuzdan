"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

type ProductsCtx = {
  products: Product[];
  ready: boolean;
  getById: (id: string) => Product | undefined;
  brands: string[];
};

const Ctx = createContext<ProductsCtx | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: { products?: Product[] }) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ProductsCtx>(
    () => ({
      products,
      ready,
      getById: (id) => products.find((p) => p.id === id),
      brands: [...new Set(products.map((p) => p.brand))].sort(),
    }),
    [products, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProducts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProducts needs ProductsProvider");
  return ctx;
}
