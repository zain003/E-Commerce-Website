import React from "react";
import { CatalogSkeletonGrid } from "@/components/search/catalog-view";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted/70 animate-pulse" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-72 rounded-lg bg-muted animate-pulse" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Skeleton on desktop */}
        <div className="hidden lg:block space-y-6">
          <div className="h-6 w-24 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-muted/60 animate-pulse" />
            ))}
          </div>
          <div className="h-6 w-24 rounded bg-muted animate-pulse pt-4" />
          <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="lg:col-span-3">
          <CatalogSkeletonGrid count={6} />
        </div>
      </div>
    </div>
  );
}
