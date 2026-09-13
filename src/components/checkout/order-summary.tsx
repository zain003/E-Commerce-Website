"use client";

import * as React from "react";
import Image from "next/image";
import { CheckoutPreview } from "@/types";
import { formatCurrency } from "@/components/product/price-tag";
import { ShieldCheck, Lock, RotateCcw, ChevronDown, ChevronUp, Package } from "lucide-react";
import { calculateShippingFee } from "@/lib/services/shipping-calculator";

export interface CheckoutOrderSummaryProps {
  preview: CheckoutPreview;
  selectedShippingMethodId?: "STANDARD" | "EXPRESS";
  className?: string;
}

export function CheckoutOrderSummary({
  preview,
  selectedShippingMethodId = "STANDARD",
  className = "",
}: CheckoutOrderSummaryProps) {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  const items = preview.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = preview.subtotal;
  const shippingFee = calculateShippingFee(subtotal, selectedShippingMethodId);
  const discountTotal = preview.discountTotal || 0.0;
  const total = Math.round((subtotal + shippingFee - discountTotal) * 100) / 100;

  return (
    <div
      className={`flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Mobile Collapsible Header */}
      <div className="flex items-center justify-between lg:hidden border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
          aria-expanded={isOpenMobile}
        >
          <span>Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          {isOpenMobile ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span
          data-testid="checkout-total-mobile"
          className="text-base font-bold text-foreground"
        >
          {formatCurrency(total)}
        </span>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between border-b border-border pb-4">
        <h3 className="text-base font-semibold text-foreground">
          Order Summary
        </h3>
        <span className="text-xs font-medium text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Itemized Cart Items (Always visible on lg, collapsible on mobile) */}
      <div
        className={`${
          isOpenMobile ? "block" : "hidden"
        } lg:block space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-border/60`}
      >
        {items.map((item) => {
          const product = item.variant?.product;
          const imageSrc =
            product?.images && product.images.length > 0
              ? product.images[0]
              : null;

          const basePrice = Number(product?.basePrice || 0);
          const priceDelta = Number(item.variant?.priceDelta || 0);
          const unitPrice = basePrice + priceDelta;
          const lineTotal = unitPrice * item.quantity;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 pt-3 first:pt-0"
            >
              {/* Thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={product?.name || "Product"}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-6 w-6" />
                  </div>
                )}
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                  {item.quantity}
                </span>
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">
                  {product?.name || "Product"}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {item.variant?.name || "Default"}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Qty: {item.quantity} × {formatCurrency(unitPrice)}
                </span>
              </div>

              {/* Line Total */}
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground">
                  {formatCurrency(lineTotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculations Breakdown */}
      <div className="space-y-2.5 border-t border-border pt-4 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span>
            Shipping (
            {selectedShippingMethodId === "EXPRESS" ? "Express" : "Standard"})
          </span>
          <span className="font-medium text-foreground">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 font-semibold">Free</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        {discountTotal > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-semibold">
              -{formatCurrency(discountTotal)}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-foreground">
            Total
          </span>
          <span
            data-testid="checkout-total"
            className="text-lg sm:text-xl font-extrabold text-foreground"
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Trust & Security Signals */}
      <div className="rounded-xl bg-muted/40 p-3.5 space-y-2 border border-border/50 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>256-bit Encrypted Checkout</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Guaranteed Safe & Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>Free 30-Day Returns on All Orders</span>
        </div>
      </div>
    </div>
  );
}
