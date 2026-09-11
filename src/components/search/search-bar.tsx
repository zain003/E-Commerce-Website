"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({
  initialQuery,
  placeholder = "Search products by name or description...",
  className,
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlQuery = searchParams.get("q") ?? searchParams.get("query") ?? "";
  const [value, setValue] = React.useState(initialQuery ?? urlQuery);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync internal state if URL parameter changes externally
  React.useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  const updateUrlQuery = React.useCallback(
    (newQuery: string) => {
      if (onSearch) {
        onSearch(newQuery);
      }

      const params = new URLSearchParams(searchParams.toString());
      const trimmed = newQuery.trim();

      if (trimmed.length > 0) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
        params.delete("query");
      }

      // Reset pagination on query change
      params.delete("page");

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [onSearch, pathname, router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateUrlQuery(newValue);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      updateUrlQuery(value);
    }
  };

  const handleClear = () => {
    setValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlQuery("");
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="catalog-search-input" className="sr-only">
        Search products
      </label>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          id="catalog-search-input"
          role="searchbox"
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search products"
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-xs transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
