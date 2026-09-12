"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { formatCurrency } from "@/components/product/price-tag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckoutClick?: () => void;
  className?: string;
  isCompact?: boolean;
}

const FREE_SHIPPING_THRESHOLD = 100.0;

export function CartSummary({
  subtotal,
  itemCount,
  onCheckoutClick,
  className,
  isCompact = false,
}: CartSummaryProps) {
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs",
        className
      )}
    >
      {/* Free Shipping Progress Indicator */}
      <div className="rounded-xl bg-muted/60 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground mb-1.5">
          <Truck className="h-4 w-4 text-primary shrink-0" />
          {isFreeShipping ? (
            <span className="text-emerald-600 font-semibold">
              You qualify for Free Standard Shipping!
            </span>
          ) : (
            <span>
              Add{" "}
              <strong className="text-foreground">
                {formatCurrency(amountNeeded)}
              </strong>{" "}
              more for Free Shipping
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Calculations */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span
            data-testid="cart-subtotal"
            className="font-semibold text-foreground"
          >
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated Shipping</span>
          <span className="font-medium text-foreground">
            {isFreeShipping ? (
              <span className="text-emerald-600 font-semibold">Free</span>
            ) : (
              "Calculated at checkout"
            )}
          </span>
        </div>

        <div className="border-t border-border pt-2.5 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">Estimated Total</span>
          <span className="text-lg font-extrabold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="space-y-2 pt-2">
        <Link href="/checkout" onClick={onCheckoutClick} className="w-full block">
          <Button
            type="button"
            size="lg"
            disabled={itemCount === 0}
            className="w-full gap-2 font-semibold shadow-sm cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {!isCompact && (
          <Link
            href="/products"
            onClick={onCheckoutClick}
            className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Continue Shopping
          </Link>
        )}
      </div>

      {/* Trust Signal */}
      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Guaranteed safe & secure checkout</span>
      </div>
    </div>
  );
}
