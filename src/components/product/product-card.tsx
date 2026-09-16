"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceTag, toNumericPrice } from "@/components/product/price-tag";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { Product, Category, ProductVariant } from "@/types";
import { useCartStore, registerCartItemDetails } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: (Omit<Product, "basePrice"> & {
    basePrice: number | string | { toNumber?: () => number; toString: () => string };
  }) & {
    category?: Category | null;
    variants?: ProductVariant[];
  };
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null);

  const hasImages = product.images && product.images.length > 0 && product.images[0];
  const primaryImage = hasImages ? product.images[0] : null;
  const secondaryImage = hasImages && product.images.length > 1 ? product.images[1] : null;

  const numericBase = toNumericPrice(product.basePrice);

  const handleQuickAdd = async (variant: ProductVariant, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    registerCartItemDetails(variant.id, {
      variant,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: numericBase,
        images: product.images,
      },
    });

    setAddedVariantId(variant.id);
    await addItem(variant.id, 1);
    setTimeout(() => setAddedVariantId(null), 1500);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-atelier transition-all duration-300 hover:border-border hover:shadow-atelier-lg",
        className
      )}
    >
      {/* Image Container with 3:4 Luxury Aspect Ratio & Fallback */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
        {primaryImage ? (
          <>
            {/* Primary Image */}
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                secondaryImage && "transition-opacity duration-500 ease-out group-hover:opacity-0"
              )}
            />

            {/* Secondary Image Cross-Fade on Hover */}
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105 pointer-events-none"
              />
            )}
          </>
        ) : (
          <div
            data-testid="product-card-placeholder"
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground transition-colors group-hover:bg-muted/60"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 shadow-xs">
              <ShoppingBag className="h-6 w-6 text-muted-foreground/80" />
            </div>
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Floating Frosted Badges Over Image */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.category && (
            <Badge
              variant="secondary"
              className="backdrop-blur-md bg-white/90 text-foreground text-[10px] font-bold tracking-[0.15em] uppercase shadow-xs px-2.5 py-0.5 border border-white/40"
            >
              {product.category.name}
            </Badge>
          )}
          {product.featured && (
            <span className="inline-flex items-center rounded-full backdrop-blur-md bg-primary/90 text-primary-foreground text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 shadow-xs">
              Atelier Pick
            </span>
          )}
        </div>

        {/* Glass Wishlist Button Over Image */}
        <div className="absolute top-3 right-3 z-10">
          <div className="rounded-full backdrop-blur-md bg-white/80 p-0.5 shadow-xs transition-transform duration-200 hover:scale-110 hover:bg-white">
            <WishlistButton productId={product.id} size="sm" />
          </div>
        </div>

        {/* Quick-Add Variant Slide-Up Bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
          <div className="border-t border-white/30 bg-background/95 backdrop-blur-md p-2.5 shadow-lg">
            {product.variants && product.variants.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                  Quick Add to Bag
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {product.variants.slice(0, 4).map((variant) => {
                    const isOOS = variant.stock === 0;
                    const isJustAdded = addedVariantId === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isOOS}
                        onClick={(e) => handleQuickAdd(variant, e)}
                        className={cn(
                          "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-semibold transition-all cursor-pointer",
                          isJustAdded
                            ? "bg-emerald-600 text-white"
                            : isOOS
                            ? "border border-border/50 text-muted-foreground/50 opacity-50 cursor-not-allowed line-through"
                            : "border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                        )}
                        title={isOOS ? `${variant.name} (Out of stock)` : `Add ${variant.name}`}
                      >
                        {isJustAdded ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span>{variant.name.split("/")[0]?.trim() || variant.name}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Link
                href={`/products/${product.slug}`}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline py-1"
              >
                <span>View Options & Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-card">
        <div>
          <h3
            className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent"
            title={product.name}
          >
            <Link
              href={`/products/${product.slug}`}
              className="truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              aria-label={product.name}
            >
              {product.name}
            </Link>
          </h3>

          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Link CTA */}
        <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-border/40">
          <PriceTag basePrice={product.basePrice} size="md" className="tabular-nums font-semibold tracking-tight" />

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:translate-x-0.5"
            tabIndex={-1}
            aria-hidden="true"
          >
            <span>Discover</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

