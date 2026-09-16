"use client";

import React, { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, AlertCircle, ArrowRight, Sparkles, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { CartItemRow } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/product/price-tag";

const UPSELL_ITEMS = [
  {
    id: "upsell-1",
    name: "Cashmere Ribbed Beanie",
    price: 65,
    slug: "classic-organic-cotton-tee",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300",
  },
  {
    id: "upsell-2",
    name: "Artisanal Leather Belt",
    price: 85,
    slug: "performance-hoodie",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=300",
  },
  {
    id: "upsell-3",
    name: "Organic Cotton Socks",
    price: 24,
    slug: "classic-organic-cotton-tee",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=300",
  },
];

export function CartDrawer() {
  const router = useRouter();
  const titleId = useId();

  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const clearError = useCartStore((state) => state.clearError);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Initialize cart on mount if not yet loaded
  useEffect(() => {
    if (cart === null) {
      fetchCart();
    }
  }, [cart, fetchCart]);

  // Handle ESC key and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const isEmpty = items.length === 0;

  const handleStartShopping = () => {
    closeCart();
    router.push("/products");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        data-testid="cart-backdrop"
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
      />

      {/* Drawer Surface */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 id={titleId} className="font-serif text-base font-bold text-foreground">
              Shopping Cart
            </h2>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                {itemCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="ml-2 hover:opacity-80 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Drawer Body */}
        {isEmpty ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Your cart is empty
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Looks like you haven't added anything to your cart yet. Explore our
              collection to find artisanal pieces you love!
            </p>
            <Button
              type="button"
              size="md"
              onClick={handleStartShopping}
              className="mt-6 gap-2 font-semibold shadow-xs cursor-pointer rounded-full"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Populated State */
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-border">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onItemClick={closeCart}
                />
              ))}
            </div>

            {/* Complete the Look Upsell Strip */}
            <div className="border-t border-border/70 bg-muted/20 px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span>Complete the Look</span>
                </span>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="text-[10px] font-semibold text-primary hover:underline"
                >
                  All Pieces &rarr;
                </Link>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {UPSELL_ITEMS.map((upsell) => (
                  <Link
                    key={upsell.id}
                    href={`/products/${upsell.slug}`}
                    onClick={closeCart}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-card p-1.5 shadow-2xs hover:border-foreground/30 transition-colors w-40"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={upsell.image}
                        alt={upsell.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-semibold text-foreground">
                        {upsell.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatCurrency(upsell.price)}
                      </div>
                    </div>
                    <div className="rounded-full bg-muted p-1 text-muted-foreground shrink-0">
                      <Plus className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sticky Drawer Footer Summary */}
            <div className="border-t border-border bg-card p-5">
              <CartSummary
                subtotal={subtotal}
                itemCount={itemCount}
                onCheckoutClick={closeCart}
                isCompact
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

