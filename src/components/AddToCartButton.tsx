"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  productId,
  disabled,
  className,
}: {
  productId: string;
  disabled?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const { t } = useLocale();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      className={`btn-primary ${className || "w-full sm:w-auto"}`}
      onClick={() => {
        add(productId);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {disabled ? t.outOfStock : added ? t.added : t.addToCart}
    </button>
  );
}
