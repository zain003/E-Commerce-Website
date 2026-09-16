"use client";

import React, { useState, useEffect } from "react";
import { Ruler, X, Check } from "lucide-react";

export function SizeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  useEffect(() => {
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

  const sizingData = [
    { size: "XS", chest: unit === "in" ? "34 - 36" : "86 - 91", waist: unit === "in" ? "28 - 30" : "71 - 76", hips: unit === "in" ? "34 - 36" : "86 - 91" },
    { size: "S", chest: unit === "in" ? "36 - 38" : "91 - 97", waist: unit === "in" ? "30 - 32" : "76 - 81", hips: unit === "in" ? "36 - 38" : "91 - 97" },
    { size: "M", chest: unit === "in" ? "38 - 40" : "97 - 102", waist: unit === "in" ? "32 - 34" : "81 - 86", hips: unit === "in" ? "38 - 40" : "97 - 102" },
    { size: "L", chest: unit === "in" ? "40 - 42" : "102 - 107", waist: unit === "in" ? "34 - 36" : "86 - 91", hips: unit === "in" ? "40 - 42" : "102 - 107" },
    { size: "XL", chest: unit === "in" ? "42 - 45" : "107 - 114", waist: unit === "in" ? "36 - 39" : "91 - 99", hips: unit === "in" ? "42 - 45" : "107 - 114" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground underline decoration-border underline-offset-4 cursor-pointer"
      >
        <Ruler className="h-3.5 w-3.5 text-accent" />
        <span>Size Guide & Fit Predictor</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-accent" />
                <h3 id="size-guide-title" className="font-serif text-base font-bold text-foreground">
                  Atelier Sizing & Fit Predictor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Close size guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Fit Predictor Summary */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
                <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-accent" />
                  <span>Tailored Regular Fit</span>
                </div>
                This garment is tailored true to universal atelier sizing. For an effortlessly relaxed or layered aesthetic, we recommend sizing up one increment.
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Body Measurements
                </span>
                <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setUnit("in")}
                    className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                      unit === "in" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("cm")}
                    className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                      unit === "cm" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Centimeters
                  </button>
                </div>
              </div>

              {/* Measurement Table */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest ({unit})</th>
                      <th className="py-2.5 px-3">Waist ({unit})</th>
                      <th className="py-2.5 px-3">Hips ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sizingData.map((row) => (
                      <tr key={row.size} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 font-bold text-foreground">{row.size}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{row.chest}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{row.waist}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border/80 bg-muted/30 px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
