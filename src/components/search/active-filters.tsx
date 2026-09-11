"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ActiveFiltersProps {
  query?: string;
  categorySlug?: string;
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  className?: string;
}

export function ActiveFilters({
  query,
  categorySlug,
  categoryName,
  minPrice,
  maxPrice,
  inStockOnly,
  className,
}: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read current filters from props or searchParams fallback
  const activeQuery = query ?? searchParams.get("q") ?? searchParams.get("query") ?? undefined;
  const activeCategory = categorySlug ?? searchParams.get("category") ?? searchParams.get("categorySlug") ?? undefined;
  const activeMinPrice = minPrice ?? (searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined);
  const activeMaxPrice = maxPrice ?? (searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined);
  const activeInStock =
    inStockOnly !== undefined
      ? inStockOnly
      : searchParams.get("inStock") === "true" || searchParams.get("inStockOnly") === "true";

  const hasActiveFilters =
    Boolean(activeQuery && activeQuery.trim().length > 0) ||
    Boolean(activeCategory && activeCategory.trim().length > 0) ||
    activeMinPrice !== undefined ||
    activeMaxPrice !== undefined ||
    Boolean(activeInStock);

  if (!hasActiveFilters) {
    return null;
  }

  const removeFilter = (filterType: "q" | "category" | "price" | "inStock") => {
    const params = new URLSearchParams(searchParams.toString());

    if (filterType === "q") {
      params.delete("q");
      params.delete("query");
    } else if (filterType === "category") {
      params.delete("category");
      params.delete("categorySlug");
    } else if (filterType === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (filterType === "inStock") {
      params.delete("inStock");
      params.delete("inStockOnly");
    }

    params.delete("page");

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  const clearAllFilters = () => {
    // Preserve sort option if user has it set, or clear all
    router.replace(pathname, { scroll: false });
  };

  let priceLabel = "";
  if (activeMinPrice !== undefined && activeMaxPrice !== undefined) {
    priceLabel = `Price: $${activeMinPrice} - $${activeMaxPrice}`;
  } else if (activeMinPrice !== undefined) {
    priceLabel = `Price: > $${activeMinPrice}`;
  } else if (activeMaxPrice !== undefined) {
    priceLabel = `Price: < $${activeMaxPrice}`;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 pt-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">Active:</span>

      {/* Query pill */}
      {activeQuery && activeQuery.trim().length > 0 && (
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium bg-muted/80 text-foreground border border-border"
        >
          <span>Search: &quot;{activeQuery}&quot;</span>
          <button
            type="button"
            onClick={() => removeFilter("q")}
            aria-label="Remove search filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Category pill */}
      {activeCategory && activeCategory.trim().length > 0 && (
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium bg-muted/80 text-foreground border border-border"
        >
          <span>Category: {categoryName || activeCategory}</span>
          <button
            type="button"
            onClick={() => removeFilter("category")}
            aria-label="Remove category filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Price range pill */}
      {priceLabel.length > 0 && (
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium bg-muted/80 text-foreground border border-border"
        >
          <span>{priceLabel}</span>
          <button
            type="button"
            onClick={() => removeFilter("price")}
            aria-label="Remove price filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* In-stock pill */}
      {activeInStock && (
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium bg-muted/80 text-foreground border border-border"
        >
          <span>In Stock Only</span>
          <button
            type="button"
            onClick={() => removeFilter("inStock")}
            aria-label="Remove in stock filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Clear all CTA */}
      <button
        type="button"
        onClick={clearAllFilters}
        aria-label="Clear all filters"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
