"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, TrendingUp, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "Cashmere Sweater",
  "Tailored Wool Coat",
  "Leather Weekend Bag",
  "Organic Cotton Tee",
  "Minimalist Linen Shirt",
];

const CURATED_LINKS = [
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Featured Collection", href: "/products?featured=true" },
  { label: "Complete Catalog", href: "/products" },
];

export function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);


  const handleSearchSubmit = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.location.href = trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(query);
  };

  return (
    <>
      {/* Search Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open search spotlight"
        className="group relative inline-flex h-9 items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted/70 hover:text-foreground cursor-pointer md:w-56 lg:w-64"
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="hidden sm:inline truncate">Search essentials...</span>
        <span className="sm:hidden">Search</span>

        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/90 shadow-2xs md:inline-flex">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      {/* Spotlight Overlay Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="spotlight-search-title"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-50"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Search Input Bar Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-border/80 px-4 py-3.5">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                id="spotlight-search-title"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, materials, or collections..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                ESC
              </button>
            </form>

            {/* Modal Body */}
            <div className="p-4 space-y-5">
              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2.5">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSearchSubmit(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-foreground transition-all hover:border-foreground/30 hover:bg-muted cursor-pointer"
                    >
                      <span>{item}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2.5">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span>Curated Shortcuts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CURATED_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-2.5 text-left text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-muted/50 cursor-pointer"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" />
                <span>Press <strong className="font-semibold text-foreground">Enter</strong> to search</span>
              </div>
              <span>Modern Atelier Discovery</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
