"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { SortOption } from "@/types";
import { cn } from "@/lib/utils";

export interface SortDropdownProps {
  currentSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

export function SortDropdown({
  currentSort,
  onSortChange,
  className,
}: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlSort = (searchParams.get("sort") ?? searchParams.get("sortBy") ?? "newest") as SortOption;
  const activeSort = currentSort ?? urlSort;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SortOption;
    if (onSortChange) {
      onSortChange(selected);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (selected === "newest") {
      params.delete("sort");
      params.delete("sortBy");
    } else {
      params.set("sort", selected);
    }

    // Reset pagination on sort change
    params.delete("page");

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  return (
    <div className={cn("relative inline-flex items-center gap-2", className)}>
      <label htmlFor="sort-dropdown-select" className="sr-only">
        Sort products
      </label>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
        <select
          id="sort-dropdown-select"
          aria-label="Sort products by"
          value={activeSort}
          onChange={handleSelect}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-background py-2 pl-8 pr-8 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 flex items-center text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
