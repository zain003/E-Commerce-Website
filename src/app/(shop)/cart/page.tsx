"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { CartItemRow } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (cart === null) {
      fetchCart();
    }
  }, [cart, fetchCart]);

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const isEmpty = items.length === 0;

  if (isEmpty && !isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Looks like you haven&apos;t added anything to your cart yet. Explore our
          collection to find something you love!
        </p>
        <div className="mt-8">
          <Link href="/products">
            <Button size="lg" className="gap-2 font-semibold shadow-xs cursor-pointer">
              <span>Start Shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold" aria-current="page">
          Cart
        </span>
      </nav>

      <div className="flex items-baseline justify-between border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Shopping Cart
        </h1>
        <span className="text-sm font-medium text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs divide-y divide-border">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <CartSummary subtotal={subtotal} itemCount={itemCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
