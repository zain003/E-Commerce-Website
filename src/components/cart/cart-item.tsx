"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { HydratedCartItem } from "@/types";
import { toNumericPrice, formatCurrency } from "@/components/product/price-tag";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export interface CartItemProps {
  item: HydratedCartItem;
  className?: string;
  onItemClick?: () => void;
}

export function CartItemRow({ item, className, onItemClick }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const isMutating = useCartStore((state) => state.isMutating);

  const product = item.variant?.product;
  const variant = item.variant;

  const basePrice = product ? toNumericPrice(product.basePrice) : 0;
  const delta = variant ? toNumericPrice(variant.priceDelta) : 0;
  const unitPrice = basePrice + delta;
  const lineTotal = unitPrice * item.quantity;

  const hasImage = product?.images && product.images.length > 0 && product.images[0];
  const primaryImage = hasImage ? product.images[0] : null;

  const isMaxStock = variant ? item.quantity >= variant.stock : false;
  const isMinQuantity = item.quantity <= 1;

  const handleIncrement = () => {
    if (isMaxStock || isMutating) return;
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (isMinQuantity || isMutating) return;
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = () => {
    if (isMutating) return;
    removeItem(item.id);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-4 border-b border-border transition-colors",
        className
      )}
    >
      {/* Product Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product?.name || "Product image"}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between self-stretch">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground line-clamp-1">
              {product ? (
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onItemClick}
                  className="hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
              ) : (
                "Item"
              )}
            </h4>
            {variant?.name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {variant.name}
              </p>
            )}
            <p className="text-xs font-medium text-foreground mt-1">
              {formatCurrency(unitPrice)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isMutating}
            aria-label="Remove item"
            className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom controls: Stepper and Line Total */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-border rounded-lg bg-background shadow-2xs">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isMinQuantity || isMutating}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span
              data-testid="item-quantity"
              className="flex h-7 min-w-8 items-center justify-center text-xs font-semibold text-foreground select-none"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMaxStock || isMutating}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Line item subtotal */}
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(lineTotal)}
            </span>
            {isMaxStock && (
              <span className="block text-[10px] text-destructive font-medium">
                Max stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
