"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchX, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { Category, Product, SortOption } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/search/search-bar";
import { SortDropdown } from "@/components/search/sort-dropdown";
import { ActiveFilters } from "@/components/search/active-filters";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { FilterDrawer } from "@/components/search/filter-drawer";
import { ProductWithCategory } from "@/lib/services/search";
import { cn } from "@/lib/utils";

export interface CatalogViewProps {
  initialProducts: (Product & { category?: Category })[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialTotalPages: number;
  categories: Category[];
  isLoading?: boolean;
}

export function CatalogSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      data-testid="catalog-skeleton-grid"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          data-testid="product-card-skeleton"
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-square w-full bg-muted" />
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded-md bg-muted" />
            <div className="h-3 w-1/2 rounded-md bg-muted" />
            <div className="pt-2 flex items-center justify-between">
              <div className="h-5 w-16 rounded-md bg-muted" />
              <div className="h-4 w-12 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogView({
  initialProducts,
  initialTotal,
  initialPage,
  initialLimit,
  initialTotalPages,
  categories,
  isLoading: propIsLoading,
}: CatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [products, setProducts] = React.useState(initialProducts);
  const [total, setTotal] = React.useState(initialTotal);
  const [page, setPage] = React.useState(initialPage);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [isLoading, setIsLoading] = React.useState(propIsLoading ?? false);

  // Sync prop changes
  React.useEffect(() => {
    if (propIsLoading !== undefined) {
      setIsLoading(propIsLoading);
    }
  }, [propIsLoading]);

  // Synchronize with URL searchParams & client-fetch /api/search on param changes
  const isInitialMount = React.useRef(true);
  const currentParamsString = searchParams.toString();

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const endpoint = currentParamsString
      ? `/api/search?${currentParamsString}`
      : `/api/search`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success && data.data) {
          setProducts(data.data.items);
          setTotal(data.data.total);
          setPage(data.data.page);
          setTotalPages(data.data.totalPages);
        }
      })
      .catch((err) => {
        console.error("Client search error:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentParamsString]);

  // Active filters extraction
  const query = searchParams.get("q") ?? searchParams.get("query") ?? undefined;
  const categorySlug =
    searchParams.get("category") ?? searchParams.get("categorySlug") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const inStockOnly =
    searchParams.get("inStock") === "true" || searchParams.get("inStockOnly") === "true";
  const sortBy = (searchParams.get("sort") ?? searchParams.get("sortBy") ?? "newest") as SortOption;

  const activeCategoryObj = categories.find((c) => c.slug === categorySlug);
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : categorySlug;

  const navigateToPage = (newPage: number) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const handleClearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header section with Search & Mobile Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-xl">
            <SearchBar initialQuery={query} isLoading={isLoading} />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <FilterDrawer
              categories={categories}
            />
            <SortDropdown currentSort={sortBy} />
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilters
          query={query}
          categorySlug={categorySlug}
          categoryName={activeCategoryName}
          minPrice={minPrice}
          maxPrice={maxPrice}
          inStockOnly={inStockOnly}
        />
      </div>

      {/* Main Catalog Content: Sidebar + Products Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-4">
        {/* Desktop Sidebar (Col 1) */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            categories={categories}
            selectedCategory={categorySlug}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStockOnly={inStockOnly}
          />
        </div>

        {/* Product Grid & Controls (Col 2-4) */}
        <div className="md:col-span-3 space-y-6">
          {/* Results Counter Bar */}
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground border-b border-border pb-3">
            <span>
              Showing {products.length} {products.length === 1 ? "item" : "items"}
              {total > 0 && ` of ${total} total`}
            </span>
            {totalPages > 1 && (
              <span>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* Loading Skeleton or Products Grid or Empty State */}
          {isLoading ? (
            <CatalogSkeletonGrid count={6} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 4}
                />
              ))}
            </div>
          ) : (
            /* User-Friendly Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No products found
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                We couldn&apos;t find any items matching your current search or filter
                criteria. Try adjusting your keywords or clearing filters.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleClearAll}
                  data-testid="empty-state-clear-btn"
                  aria-label="Clear all filters"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Accessible Pagination Bar */}
          {!isLoading && totalPages > 1 && (
            <nav
              aria-label="Pagination navigation"
              className="flex items-center justify-center gap-2 pt-8"
            >
              <button
                type="button"
                onClick={() => navigateToPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => navigateToPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => navigateToPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
