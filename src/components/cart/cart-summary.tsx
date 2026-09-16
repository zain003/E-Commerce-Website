"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/components/product/price-tag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CouponInput } from "@/components/cart/coupon-input";

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
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const discountTotal = useCartStore((s) => s.discountTotal);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const estimatedTotal = Math.max(0, subtotal - discountTotal);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-atelier",
        className
      )}
    >
      {/* Gamified Free Shipping Progress Meter */}
      <div
        className={cn(
          "rounded-xl p-3.5 text-xs transition-colors",
          isFreeShipping
            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-950"
            : "border border-border/80 bg-muted/40 text-foreground"
        )}
      >
        <div className="flex items-center gap-2 font-medium mb-2">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse shrink-0" />
              <span>Complimentary Carbon-Neutral Shipping Unlocked!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent shrink-0" />
              <span>
                Add{" "}
                <strong className="text-foreground font-bold">
                  {formatCurrency(amountNeeded)}
                </strong>{" "}
                more for Complimentary Delivery
              </span>
            </div>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/80">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isFreeShipping ? "bg-emerald-600" : "bg-accent"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Promo Code Input Form */}
      <div className="border-t border-border/60 pt-3">
        <CouponInput />
      </div>

      {/* Calculations */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span
            data-testid="cart-subtotal"
            className="font-semibold text-foreground tabular-nums tracking-tight"
          >
            {formatCurrency(subtotal)}
          </span>
        </div>

        {discountTotal > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>
              Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}
            </span>
            <span data-testid="discount-amount" className="tabular-nums tracking-tight">
              -{formatCurrency(discountTotal)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated Shipping</span>
          <span className="font-medium text-foreground">
            {isFreeShipping ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 inline" />
                <span>Complimentary</span>
              </span>
            ) : (
              "Calculated at checkout"
            )}
          </span>
        </div>

        <div className="border-t border-border pt-2.5 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">Estimated Total</span>
          <span
            data-testid="cart-estimated-total"
            className="text-lg font-extrabold text-foreground tabular-nums tracking-tight"
          >
            {formatCurrency(estimatedTotal)}
          </span>
        </div>
      </div>

      {/* Express Checkout & Standard CTA */}
      <div className="space-y-2 pt-2">
        {/* Express Checkout Row */}
        {itemCount > 0 && (
          <div className="space-y-1.5 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
              Express Checkout
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/checkout" onClick={onCheckoutClick} className="block">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-black text-white font-medium text-xs hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Pay</span>
                </button>
              </Link>
              <Link href="/checkout" onClick={onCheckoutClick} className="block">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-border bg-white text-neutral-900 font-semibold text-xs hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
                >
                  <span>G Pay</span>
                </button>
              </Link>
            </div>
          </div>
        )}

        <Link href="/checkout" onClick={onCheckoutClick} className="w-full block">
          <Button
            type="button"
            size="lg"
            disabled={itemCount === 0}
            className="w-full gap-2 font-semibold shadow-sm cursor-pointer rounded-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
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

      {/* Payment Trust Row & Badges */}
      <div className="flex flex-col items-center gap-1.5 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Encrypted 256-bit SSL Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-80">
          <span>Visa</span>
          <span>•</span>
          <span>Mastercard</span>
          <span>•</span>
          <span>Amex</span>
          <span>•</span>
          <span>Apple Pay</span>
          <span>•</span>
          <span>Stripe</span>
        </div>
      </div>
    </div>
  );
}

