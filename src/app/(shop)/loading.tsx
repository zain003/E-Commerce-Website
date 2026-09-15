import React from "react";
import { CatalogSkeletonGrid } from "@/components/search/catalog-view";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="flex flex-col items-center text-center py-12 space-y-4">
        <div className="h-6 w-48 rounded-full bg-muted" />
        <div className="h-12 w-3/4 max-w-2xl rounded-lg bg-muted" />
        <div className="h-5 w-1/2 max-w-xl rounded-md bg-muted/70" />
        <div className="pt-4 flex gap-4">
          <div className="h-11 w-48 rounded-full bg-muted" />
          <div className="h-11 w-40 rounded-full bg-muted/60" />
        </div>
      </div>

      {/* Featured Grid Skeleton */}
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <CatalogSkeletonGrid count={4} />
      </div>
    </div>
  );
}
