"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, Check, RotateCcw } from "lucide-react";
import { Category, SearchFilterParams } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterSidebarProps {
  categories: Category[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onFilterChange?: (filters: Partial<SearchFilterParams>) => void;
  className?: string;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  inStockOnly,
  onFilterChange,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlCategory =
    selectedCategory ?? searchParams.get("category") ?? searchParams.get("categorySlug") ?? undefined;
  const urlMinPrice =
    minPrice ?? (searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined);
  const urlMaxPrice =
    maxPrice ?? (searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined);
  const urlInStock =
    inStockOnly !== undefined
      ? inStockOnly
      : searchParams.get("inStock") === "true" || searchParams.get("inStockOnly") === "true";

  // Local price input state
  const [localMinPrice, setLocalMinPrice] = React.useState(
    urlMinPrice !== undefined ? String(urlMinPrice) : ""
  );
  const [localMaxPrice, setLocalMaxPrice] = React.useState(
    urlMaxPrice !== undefined ? String(urlMaxPrice) : ""
  );

  React.useEffect(() => {
    setLocalMinPrice(urlMinPrice !== undefined ? String(urlMinPrice) : "");
    setLocalMaxPrice(urlMaxPrice !== undefined ? String(urlMaxPrice) : "");
  }, [urlMinPrice, urlMaxPrice]);

  const hasActiveFilters =
    Boolean(urlCategory) ||
    urlMinPrice !== undefined ||
    urlMaxPrice !== undefined ||
    Boolean(urlInStock);

  const applyParamUpdates = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset pagination on filter change
    params.delete("page");

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  const handleCategorySelect = (categorySlug: string) => {
    if (onFilterChange) {
      onFilterChange({
        categorySlug: urlCategory === categorySlug ? undefined : categorySlug,
      });
    }

    if (urlCategory === categorySlug) {
      // Toggle off
      applyParamUpdates({ category: null, categorySlug: null });
    } else {
      applyParamUpdates({ category: categorySlug, categorySlug: null });
    }
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = localMinPrice.trim() !== "" ? Number(localMinPrice) : undefined;
    const maxVal = localMaxPrice.trim() !== "" ? Number(localMaxPrice) : undefined;

    if (onFilterChange) {
      onFilterChange({
        minPrice: minVal,
        maxPrice: maxVal,
      });
    }

    applyParamUpdates({
      minPrice: minVal !== undefined && !isNaN(minVal) ? String(minVal) : null,
      maxPrice: maxVal !== undefined && !isNaN(maxVal) ? String(maxVal) : null,
    });
  };

  const handleToggleInStock = () => {
    const nextInStock = !urlInStock;
    if (onFilterChange) {
      onFilterChange({ inStockOnly: nextInStock });
    }
    applyParamUpdates({ inStock: nextInStock ? "true" : null, inStockOnly: null });
  };

  const handleResetAll = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <aside
      aria-label="Product filters"
      className={cn(
        "w-full space-y-6 rounded-2xl border border-border bg-card p-5 shadow-xs",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetAll}
            aria-label="Clear all filters"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <div className="flex flex-col space-y-1">
          {categories.map((cat) => {
            const isSelected = urlCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h3>
        <form onSubmit={handleApplyPrice} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="sidebar-min-price"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Min Price
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-2.5 text-xs text-muted-foreground">
                  $
                </span>
                <input
                  id="sidebar-min-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background pl-6 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sidebar-max-price"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Max Price
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-2.5 text-xs text-muted-foreground">
                  $
                </span>
                <input
                  id="sidebar-max-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background pl-6 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg border border-border bg-muted/60 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Stock Availability Section */}
      <div className="border-t border-border pt-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            id="sidebar-in-stock"
            type="checkbox"
            checked={urlInStock}
            onChange={handleToggleInStock}
            className="h-4 w-4 rounded-xs border-border text-primary focus:ring-primary cursor-pointer accent-primary"
          />
          <span className="text-sm font-medium text-foreground select-none">
            In Stock Only
          </span>
        </label>
      </div>
    </aside>
  );
}
