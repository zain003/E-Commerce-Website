"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export interface HeaderCartButtonProps {
  className?: string;
}

export function HeaderCartButton({ className }: HeaderCartButtonProps) {
  const openCart = useCartStore((state) => state.openCart);
  const cart = useCartStore((state) => state.cart);
  const itemCount = cart?.itemCount || 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Shopping Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer md:h-9 md:w-auto md:px-3 md:gap-2",
        className
      )}
    >
      <div className="relative">
        <ShoppingBag className="h-4 w-4" />
        {itemCount > 0 && (
          <span
            data-testid="header-cart-badge"
            className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50"
          >
            {itemCount}
          </span>
        )}
      </div>
      <span className="hidden text-sm font-medium md:inline">Cart</span>
    </button>
  );
}

export function MobileCartNavButton({ className }: { className?: string }) {
  const openCart = useCartStore((state) => state.openCart);
  const cart = useCartStore((state) => state.cart);
  const itemCount = cart?.itemCount || 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Shopping Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className={cn(
        "relative flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer",
        className
      )}
    >
      <div className="relative">
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span
            data-testid="mobile-cart-badge"
            className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-xs"
          >
            {itemCount}
          </span>
        )}
      </div>
      <span>Cart</span>
    </button>
  );
}
