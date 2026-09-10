import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/product/price-tag";
import { Product, Category } from "@/types";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product & {
    category?: Category | null;
  };
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const primaryImage = hasImage ? product.images[0] : null;

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
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
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

        {/* Category Pill Over Image */}
        {product.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="bg-background/85 font-medium backdrop-blur-xs shadow-xs hover:bg-background"
            >
              {product.category.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3
            className="truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
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
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Link CTA */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50">
          <PriceTag basePrice={product.basePrice} size="md" />

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center text-xs font-semibold text-primary transition-colors hover:underline"
            tabIndex={-1}
            aria-hidden="true"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
