"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";
import { Category, SortOption, SearchFilterParams } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterDrawerProps {
  categories: Category[];
  activeFilterCount?: number;
  onFilterChange?: (filters: Partial<SearchFilterParams>) => void;
  className?: string;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

export function FilterDrawer({
  categories,
  activeFilterCount,
  onFilterChange,
  className,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const titleId = React.useId();

  // Active URL parameters
  const urlCategory = searchParams.get("category") ?? searchParams.get("categorySlug") ?? undefined;
  const urlSort = (searchParams.get("sort") ?? searchParams.get("sortBy") ?? "newest") as SortOption;
  const urlMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const urlMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const urlInStock = searchParams.get("inStock") === "true" || searchParams.get("inStockOnly") === "true";

  // Compute active count if not passed
  const calculatedActiveCount =
    activeFilterCount !== undefined
      ? activeFilterCount
      : [
          Boolean(urlCategory),
          urlMinPrice !== undefined,
          urlMaxPrice !== undefined,
          Boolean(urlInStock),
          urlSort !== "newest",
        ].filter(Boolean).length;

  // Local draft state inside drawer
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(urlCategory);
  const [selectedSort, setSelectedSort] = React.useState<SortOption>(urlSort);
  const [minPrice, setMinPrice] = React.useState(urlMinPrice !== undefined ? String(urlMinPrice) : "");
  const [maxPrice, setMaxPrice] = React.useState(urlMaxPrice !== undefined ? String(urlMaxPrice) : "");
  const [inStockOnly, setInStockOnly] = React.useState(urlInStock);

  // Sync draft state when drawer opens or URL params change
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategory(urlCategory);
      setSelectedSort(urlSort);
      setMinPrice(urlMinPrice !== undefined ? String(urlMinPrice) : "");
      setMaxPrice(urlMaxPrice !== undefined ? String(urlMaxPrice) : "");
      setInStockOnly(urlInStock);
    }
  }, [isOpen, urlCategory, urlSort, urlMinPrice, urlMaxPrice, urlInStock]);

  // Handle ESC key and scroll locking
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Category
    if (selectedCategory) {
      params.set("category", selectedCategory);
      params.delete("categorySlug");
    } else {
      params.delete("category");
      params.delete("categorySlug");
    }

    // Sort
    if (selectedSort && selectedSort !== "newest") {
      params.set("sort", selectedSort);
      params.delete("sortBy");
    } else {
      params.delete("sort");
      params.delete("sortBy");
    }

    // Prices
    const minVal = minPrice.trim() !== "" ? Number(minPrice) : undefined;
    if (minVal !== undefined && !isNaN(minVal)) {
      params.set("minPrice", String(minVal));
    } else {
      params.delete("minPrice");
    }

    const maxVal = maxPrice.trim() !== "" ? Number(maxPrice) : undefined;
    if (maxVal !== undefined && !isNaN(maxVal)) {
      params.set("maxPrice", String(maxVal));
    } else {
      params.delete("maxPrice");
    }

    // In Stock
    if (inStockOnly) {
      params.set("inStock", "true");
      params.delete("inStockOnly");
    } else {
      params.delete("inStock");
      params.delete("inStockOnly");
    }

    // Reset pagination
    params.delete("page");

    if (onFilterChange) {
      onFilterChange({
        categorySlug: selectedCategory,
        sortBy: selectedSort,
        minPrice: minVal,
        maxPrice: maxVal,
        inStockOnly,
      });
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setSelectedCategory(undefined);
    setSelectedSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);

    router.replace(pathname, { scroll: false });
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Filters & Sort"
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted active:scale-95 cursor-pointer md:hidden",
          className
        )}
      >
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <span>Filters & Sort</span>
        {calculatedActiveCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
            {calculatedActiveCount}
          </span>
        )}
      </button>

      {/* Slide-Up Bottom Sheet Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet Surface */}
          <div className="relative z-50 flex max-h-[85vh] w-full flex-col rounded-t-3xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 id={titleId} className="text-base font-bold text-foreground">
                  Filter & Sort Products
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {/* Sort Section */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSort(opt.value)}
                      className={cn(
                        "flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-center",
                        selectedSort === opt.value
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Section */}
              <div className="space-y-2.5 border-t border-border pt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(isSelected ? undefined : cat.slug)
                        }
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground font-semibold"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="space-y-2.5 border-t border-border pt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price Range ($)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Min Price</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Max Price</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* In Stock Only Section */}
              <div className="border-t border-border pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-5 w-5 rounded-xs border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground select-none">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>

            {/* Sticky Bottom Action Buttons */}
            <div className="flex items-center gap-3 border-t border-border bg-card px-6 py-4">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span>Clear All</span>
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex flex-1 items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
