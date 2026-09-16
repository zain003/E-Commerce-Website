"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: "Complimentary Carbon-Neutral Shipping on Orders Over $100",
    linkText: "Shop Collection",
    href: "/products",
  },
  {
    id: 2,
    text: "Artisanal Craftsmanship • Masterfully Tailored Pure Fabrics",
    linkText: "Discover Story",
    href: "/#story",
  },
  {
    id: 3,
    text: "30-Day Effortless Returns & Worldwide Complimentary Exchanges",
    linkText: "Learn More",
    href: "/products",
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <aside
      aria-label="Store announcement"
      className="relative z-40 flex h-9 w-full items-center justify-center bg-primary text-primary-foreground px-4 text-[11px] font-medium tracking-wide transition-colors"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <Sparkles className="h-3 w-3 text-accent shrink-0 animate-pulse" />
        <span className="truncate">{current.text}</span>
        <Link
          href={current.href}
          className="hidden sm:inline-flex items-center gap-1 font-semibold text-accent hover:underline ml-1.5 shrink-0"
        >
          <span>{current.linkText}</span>
          <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      {/* Progress Dots */}
      <div className="absolute right-4 hidden lg:flex items-center gap-1.5" aria-hidden="true">
        {ANNOUNCEMENTS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-4 bg-accent"
                : "w-1.5 bg-primary-foreground/30 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to announcement ${idx + 1}`}
          />
        ))}
      </div>
    </aside>
  );
}
