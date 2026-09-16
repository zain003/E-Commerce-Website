"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      <Link
        href="/products"
        onClick={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
      >
        <span>Catalog</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : "text-muted-foreground"
          }`}
        />
      </Link>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full -left-20 z-50 mt-1 w-[560px] rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="grid grid-cols-2 gap-6">
            {/* Column 1: Featured Collections */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                Collections
              </div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products?featured=true"
                    onClick={() => setIsOpen(false)}
                    className="group block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary flex items-center justify-between">
                      <span>Featured Atelier Selection</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Handpicked luxury essentials and bestsellers.
                    </p>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?sort=newest"
                    onClick={() => setIsOpen(false)}
                    className="group block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary flex items-center justify-between">
                      <span>New Season Arrivals</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Freshly tailored garments and artisanal pieces.
                    </p>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="group block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary flex items-center justify-between">
                      <span>Full Catalog Archive</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Browse all available items across every category.
                    </p>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Editorial Spotlight */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  <Sparkles className="h-3 w-3" />
                  <span>Artisanal Craft</span>
                </div>
                <h4 className="mt-2.5 font-serif text-sm font-bold text-foreground">
                  The Cashmere & Wool Edit
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Ethically harvested fibers, spun with generational mastery into timeless wardrobe anchors.
                </p>
              </div>

              <Link
                href="/products?category=apparel"
                onClick={() => setIsOpen(false)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Explore the Edit</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
