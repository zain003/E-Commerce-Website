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
  Sparkles,
  ChevronDown,
  Star,
  Leaf,
  CheckCircle2,
} from "lucide-react";

import { useCartStore, registerCartItemDetails } from "@/store/cart-store";
import { ReviewSection } from "@/components/reviews/review-section";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { SizeGuideModal } from "@/components/product/size-guide-modal";

export interface ProductDetailViewProps {
  product: ProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const addItem = useCartStore((state) => state.addItem);

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

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const isLowStock = selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5;

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("materials");

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Register variant details for instant optimistic cart addition
  React.useEffect(() => {
    if (product.variants) {
      product.variants.forEach((v) => {
        registerCartItemDetails(v.id, {
          variant: v,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            basePrice: numericBase,
            images: product.images,
          },
        });
      });
    }
  }, [product, numericBase]);

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedVariant) return;
    addItem(selectedVariant.id, 1);
  };

  return (
    <div className="relative pb-36 md:pb-12">
      {/* Editorial Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="transition-colors hover:text-foreground">
          Catalog
        </Link>
        <ChevronRight className="h-3 w-3" />
        {product.category && (
          <>
            <Link
              href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="transition-colors hover:text-foreground"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="truncate text-foreground font-semibold" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
        {/* Left Column: Imagery Gallery (7 cols on large desktop) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.name} />
        </div>

        {/* Right Column: Sticky Buy Box (5 cols on large desktop) */}
        <div className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start bg-card p-6 rounded-2xl border border-border/80 shadow-atelier">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {product.category && (
                <Badge
                  variant="secondary"
                  className="bg-muted/60 text-foreground text-[10px] font-bold tracking-[0.15em] uppercase border border-border/60"
                >
                  {product.category.name}
                </Badge>
              )}
              <SizeGuideModal />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
              {product.name}
            </h1>

            {/* Social Proof Star Rating */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center gap-0.5 text-accent" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <a
                href="#reviews"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Verified Buyer Reviews
              </a>
            </div>

            <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Low Stock Urgency Signal */}
          {isLowStock && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span>Only {selectedVariant?.stock} left in stock — order soon</span>
            </div>
          )}

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
              className="flex-1 gap-2 text-base font-semibold shadow-sm cursor-pointer rounded-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-98 transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </Button>
            <div className="rounded-full border border-border p-1 hover:border-foreground/40 transition-colors">
              <WishlistButton
                productId={product.id}
                size="lg"
                className="shrink-0"
              />
            </div>
          </div>

          {/* Luxury Collapsible Accordions */}
          <div className="divide-y divide-border/60 border-t border-b border-border/60 text-xs">
            {/* Accordion 1: Materials & Craft */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("materials")}
                className="flex w-full items-center justify-between font-bold text-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <span className="uppercase tracking-wider">Materials & Craftsmanship</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "materials" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "materials" && (
                <div className="pt-2 pb-1 text-muted-foreground leading-relaxed animate-in fade-in-50">
                  Crafted from 100% sustainably farmed organic fibers, sourced directly from verified ethical mills. Finished with reinforced French seams and tailored for longevity.
                </div>
              )}
            </div>

            {/* Accordion 2: Shipping & Returns */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("shipping")}
                className="flex w-full items-center justify-between font-bold text-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <span className="uppercase tracking-wider">Shipping & 30-Day Returns</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "shipping" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "shipping" && (
                <div className="pt-2 pb-1 text-muted-foreground leading-relaxed animate-in fade-in-50 space-y-1.5">
                  <p>• Complimentary carbon-neutral standard delivery on orders over $100.</p>
                  <p>• 30-day effortless returns and worldwide exchanges on all unworn items.</p>
                  <p>• Dispatch within 24 hours in 100% recyclable, plastic-free packaging.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Care Guide */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("care")}
                className="flex w-full items-center justify-between font-bold text-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <span className="uppercase tracking-wider">Care & Longevity Guide</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "care" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "care" && (
                <div className="pt-2 pb-1 text-muted-foreground leading-relaxed animate-in fade-in-50">
                  Machine wash cold on gentle cycle with eco-friendly detergent. Lay flat to air dry away from direct sunlight. Cool iron on reverse if needed. Do not bleach or dry clean.
                </div>
              )}
            </div>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-[10px] text-muted-foreground text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-accent" />
              <span>Carbon Neutral</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5 text-accent" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Stripe Protected</span>
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
            className="flex-1 gap-2 font-semibold shadow-xs rounded-full"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </Button>

          <WishlistButton
            productId={product.id}
            size="md"
            className="border border-border shrink-0 rounded-full"
          />
        </div>
      </aside>
    </div>
  );
}

