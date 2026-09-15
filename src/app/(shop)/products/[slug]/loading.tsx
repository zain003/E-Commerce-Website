import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-muted" />
          <div className="flex gap-3">
            <div className="h-20 w-20 rounded-xl bg-muted" />
            <div className="h-20 w-20 rounded-xl bg-muted" />
            <div className="h-20 w-20 rounded-xl bg-muted" />
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-full bg-muted" />
            <div className="h-8 w-3/4 rounded-md bg-muted" />
            <div className="h-7 w-28 rounded-md bg-muted" />
          </div>

          <div className="space-y-2 border-y border-border py-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-10 w-20 rounded-lg bg-muted" />
              <div className="h-10 w-20 rounded-lg bg-muted" />
              <div className="h-10 w-20 rounded-lg bg-muted" />
            </div>
          </div>

          <div className="h-12 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
