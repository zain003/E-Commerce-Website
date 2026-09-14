"use client";

import React, { useState } from "react";
import { Tag, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/components/product/price-tag";

export interface CouponInputProps {
  className?: string;
}

export function CouponInput({ className }: CouponInputProps) {
  const [code, setCode] = useState("");
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const couponError = useCartStore((s) => s.couponError);
  const isApplyingCoupon = useCartStore((s) => s.isApplyingCoupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCouponError = useCartStore((s) => s.clearCouponError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isApplyingCoupon) return;

    const res = await applyCoupon(code);
    if (res.success) {
      setCode("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (couponError) {
      clearCouponError();
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Applied Coupon Badge */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
              <span className="font-mono font-bold tracking-wider text-foreground uppercase">
                {appliedCoupon.code}
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                (
                {appliedCoupon.discountType === "PERCENTAGE"
                  ? `${appliedCoupon.discountValue}% off`
                  : `-${formatCurrency(appliedCoupon.discountValue)} off`}
                )
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            aria-label="Remove coupon"
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Coupon Code Input Form */
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="promo-code-input" className="sr-only">
              Promo code
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <input
              id="promo-code-input"
              type="text"
              name="promoCode"
              value={code}
              onChange={handleInputChange}
              placeholder="Enter promo code"
              aria-label="Promo code"
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase tracking-wider font-mono font-medium disabled:opacity-50 transition-colors"
              disabled={isApplyingCoupon}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!code.trim() || isApplyingCoupon}
            className="h-8 px-3 text-xs font-semibold cursor-pointer shrink-0"
          >
            {isApplyingCoupon ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                <span>Applying</span>
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </form>
      )}

      {/* Inline Error Alert */}
      {couponError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 font-medium">{couponError}</span>
          <button
            type="button"
            onClick={clearCouponError}
            aria-label="Dismiss error"
            className="p-0.5 hover:bg-destructive/20 rounded text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
