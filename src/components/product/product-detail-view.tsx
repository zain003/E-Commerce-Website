"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductDetail, ProductVariant } from "@/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { toNumericPrice, formatCurrency } from "@/components/product/price-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { ReviewSection } from "@/components/reviews/review-section";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export interface ProductDetailViewProps {
  product: ProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isMutating = useCartStore((state) => state.isMutating);

  // Initial selected variant (first in-stock or first available)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => {
      if (!product.variants || product.variants.length === 0) return null;
      const inStock = product.variants.find((v) => v.stock > 0);
      return inStock || product.variants[0];
    }
  );

  const numericBase = toNumericPrice(product.basePrice);
  const delta = selectedVariant ? toNumericPrice(selectedVariant.priceDelta) : 0;
  const currentTotal = numericBase + delta;

  const isOutOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : false;

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedVariant || isMutating) return;
    addItem(selectedVariant.id, 1);
  };

  return (
    <div className="relative pb-36 md:pb-12">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        {product.category && (
          <>
            <span className="text-muted-foreground">{product.category.name}</span>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="truncate text-foreground font-semibold" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Imagery Gallery (7 cols on large desktop) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.name} />
        </div>

        {/* Right Column: Product Info & Actions (5 cols on large desktop) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Header & Badges */}
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2">
                {product.category.name}
              </Badge>
            )}

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Interactive Variant Matrix */}
          <VariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            selectedVariantId={selectedVariant?.id}
            onSelectVariant={(variant) => setSelectedVariant(variant)}
          />

          {/* Desktop Primary Action Buttons */}
          <div className="hidden md:flex items-center gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 gap-2 text-base font-semibold shadow-sm cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </Button>
            <WishlistButton
              productId={product.id}
              size="lg"
              className="border border-border shrink-0"
            />
          </div>

          {/* Trust Highlights */}
          <div className="mt-2 divide-y divide-border/60 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 pb-3">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free standard shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>30-day hassle-free returns on unworn items</span>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Secure encrypted Stripe checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Rating Breakdown */}
      <ReviewSection productId={product.id} productName={product.name} />

      {/* Sticky Mobile Action Bar (acceptance criterion 4) */}
      <aside
        data-testid="sticky-mobile-bar"
        className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/95 p-3.5 backdrop-blur-md shadow-lg md:hidden"
        aria-label="Quick order action bar"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {formatCurrency(currentTotal)}
            </span>
          </div>

          <Button
            type="button"
            size="md"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="flex-1 gap-2 font-semibold shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </Button>

          <WishlistButton
            productId={product.id}
            size="md"
            className="border border-border shrink-0"
          />
        </div>
      </aside>
    </div>
  );
}
