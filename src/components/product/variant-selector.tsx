"use client";

import React, { useState, useEffect } from "react";
import { ProductVariant } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toNumericPrice, formatCurrency } from "@/components/product/price-tag";
import { Check, AlertCircle, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number | string | { toNumber?: () => number; toString: () => string };
  selectedVariantId?: string;
  onSelectVariant?: (variant: ProductVariant) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  basePrice,
  selectedVariantId,
  onSelectVariant,
  className,
}: VariantSelectorProps) {
  // Find initial selected variant: prop id -> first in-stock -> first available
  const initialVariant = React.useMemo(() => {
    if (!variants || variants.length === 0) return null;
    if (selectedVariantId) {
      const match = variants.find((v) => v.id === selectedVariantId);
      if (match) return match;
    }
    const inStock = variants.find((v) => v.stock > 0);
    return inStock || variants[0];
  }, [variants, selectedVariantId]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialVariant
  );

  useEffect(() => {
    if (initialVariant && !selectedVariant) {
      setSelectedVariant(initialVariant);
    }
  }, [initialVariant, selectedVariant]);

  const handleSelect = (variant: ProductVariant) => {
    if (variant.stock === 0) return; // Prevent selection of out-of-stock variants
    setSelectedVariant(variant);
    onSelectVariant?.(variant);
  };

  const numericBase = toNumericPrice(basePrice);
  const delta = selectedVariant ? toNumericPrice(selectedVariant.priceDelta) : 0;
  const currentTotal = numericBase + delta;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Live Total Price Header */}
      <div className="flex items-baseline justify-between border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Price
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              data-testid="variant-total-price"
              className="text-3xl font-extrabold tracking-tight text-foreground"
            >
              {formatCurrency(currentTotal)}
            </span>
            {selectedVariant && delta !== 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                ({delta > 0 ? `+${formatCurrency(delta)}` : `-${formatCurrency(Math.abs(delta))}`}{" "}
                variant adjustment)
              </span>
            )}
          </div>
        </div>

        {/* Selected Variant Stock Badge */}
        {selectedVariant && (
          <div>
            {selectedVariant.stock === 0 ? (
              <Badge variant="destructive" className="gap-1">
                <PackageX className="h-3 w-3" />
                <span>Out of Stock</span>
              </Badge>
            ) : selectedVariant.stock <= 5 ? (
              <Badge
                variant="outline"
                className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Only {selectedVariant.stock} left in stock!</span>
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                <span>In Stock</span>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Variant Pills Selection Matrix */}
      {variants && variants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Select Option / Variant
            </label>
            {selectedVariant && (
              <span className="text-xs text-muted-foreground">
                SKU: <span className="font-mono font-medium">{selectedVariant.sku}</span>
              </span>
            )}
          </div>

          <div
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            role="group"
            aria-label="Product variants"
          >
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isOutOfStock = variant.stock === 0;
              const variantDelta = toNumericPrice(variant.priceDelta);

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleSelect(variant)}
                  aria-pressed={isSelected}
                  aria-disabled={isOutOfStock}
                  className={cn(
                    "relative flex items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected && !isOutOfStock
                      ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary"
                      : "border-border bg-card text-foreground hover:border-foreground/30",
                    isOutOfStock &&
                      "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/60 opacity-60"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{variant.name}</span>
                    {variantDelta !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {variantDelta > 0 ? `+${formatCurrency(variantDelta)}` : `-${formatCurrency(Math.abs(variantDelta))}`}
                      </span>
                    )}
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                        Out of Stock
                      </span>
                    ) : isSelected ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
