"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/product/price-tag";
import { useCartStore, registerCartItemDetails } from "@/store/cart-store";
import { HydratedWishlistItem } from "@/types";
import { cn } from "@/lib/utils";

export interface WishlistCardProps {
  item: HydratedWishlistItem;
  onRemove: (productId: string) => void;
  className?: string;
}

export function WishlistCard({ item, onRemove, className }: WishlistCardProps) {
  const { product } = item;
  const addItem = useCartStore((state) => state.addItem);

  const [isProcessing, setIsProcessing] = useState(false);

  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const primaryImage = hasImage ? product.images[0] : null;

  // Determine stock and available default variant
  const inStockVariant = product.variants?.find((v) => v.stock > 0);
  const defaultVariant = inStockVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const isAvailable = Boolean(product.inStock && inStockVariant);

  React.useEffect(() => {
    if (defaultVariant) {
      registerCartItemDetails(defaultVariant.id, {
        variant: defaultVariant,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          images: product.images,
        },
      });
    }
  }, [defaultVariant, product]);

  const handleMoveToCart = async () => {
    if (!isAvailable || !defaultVariant || isProcessing) return;

    setIsProcessing(true);
    try {
      // 1. Add to cart
      addItem(defaultVariant.id, 1);

      // 2. Remove from wishlist via API
      await fetch("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      // 3. Notify parent to remove from view
      onRemove(product.id);
    } catch (error) {
      console.error("[WishlistCard] Error moving item to cart:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await fetch("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      onRemove(product.id);
    } catch (error) {
      console.error("[WishlistCard] Error removing item:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all hover:border-foreground/20 hover:shadow-md",
        className
      )}
    >
      {/* Image Container with Fallback */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/50">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 shadow-xs">
              <ShoppingBag className="h-6 w-6 text-muted-foreground/80" />
            </div>
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Category Pill Over Image */}
        {product.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="bg-background/85 font-medium backdrop-blur-xs shadow-xs"
            >
              {product.category.name}
            </Badge>
          </div>
        )}

        {/* Remove Button Over Image */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isProcessing}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-xs backdrop-blur-xs transition-all hover:scale-110 hover:bg-background hover:text-destructive active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3
              className="truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
              title={product.name}
            >
              <Link
                href={`/products/${product.slug}`}
                className="block truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              >
                {product.name}
              </Link>
            </h3>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <PriceTag basePrice={product.basePrice} size="md" />

            {/* Stock indicator badge */}
            {isAvailable ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-destructive">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Move to Cart Action Button */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <Button
            type="button"
            size="sm"
            disabled={!isAvailable || isProcessing}
            onClick={handleMoveToCart}
            className="w-full gap-2 font-medium cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{isAvailable ? "Move to Cart" : "Out of Stock"}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
