"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, Edit2, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StockQuickEditProps {
  variantId: string;
  initialStock: number;
  variantName?: string;
  sku?: string;
  onStockChange?: (newStock: number) => void;
  disabled?: boolean;
}

export function StockQuickEdit({
  variantId,
  initialStock,
  variantName,
  sku,
  onStockChange,
  disabled = false,
}: StockQuickEditProps) {
  const [stock, setStock] = useState<number>(initialStock);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(String(initialStock));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStock(initialStock);
    setInputValue(String(initialStock));
  }, [initialStock]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled || isSubmitting) return;
    setErrorMessage(null);
    setInputValue(String(stock));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrorMessage(null);
    setInputValue(String(stock));
    setIsEditing(false);
  };

  const handleSave = async (valueToSave?: string) => {
    const rawVal = valueToSave !== undefined ? valueToSave : inputValue;
    const trimmed = rawVal.trim();
    const parsed = Number(trimmed);

    if (isNaN(parsed) || !Number.isInteger(parsed)) {
      setErrorMessage("Stock must be an integer");
      return;
    }

    if (parsed < 0) {
      setErrorMessage("Stock cannot be negative");
      return;
    }

    // If unchanged, simply exit edit mode
    if (parsed === stock) {
      setIsEditing(false);
      setErrorMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/variants/${variantId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: parsed }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || "Failed to persist stock update"
        );
      }

      setStock(parsed);
      setInputValue(String(parsed));
      setIsEditing(false);
      setSuccessFlash(true);
      onStockChange?.(parsed);

      setTimeout(() => {
        setSuccessFlash(false);
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to persist stock update"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(inputValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (isEditing && !isSubmitting) {
      handleSave(inputValue);
    }
  };

  const formattedStock = stock.toLocaleString();
  const labelText = `Stock for ${variantName || sku || variantId}`;

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <div className="inline-flex items-center gap-2">
        {isEditing ? (
          <div className="relative inline-flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="number"
              min="0"
              step="1"
              aria-label={labelText}
              disabled={isSubmitting}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="h-8 w-24 rounded-md border border-border bg-background px-2.5 py-1 text-sm font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <button
                type="button"
                aria-label="Confirm stock edit"
                onClick={() => handleSave(inputValue)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4 text-emerald-600" />
              </button>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">
              {formattedStock}
            </span>

            {stock === 0 ? (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Out of stock
              </Badge>
            ) : stock < 10 ? (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                Low stock
              </Badge>
            ) : null}

            {successFlash && (
              <span className="inline-flex items-center text-xs text-emerald-600 font-medium animate-fade-in">
                Saved
              </span>
            )}

            {!disabled && (
              <button
                type="button"
                aria-label={`Edit stock for ${variantName || sku || variantId}`}
                onClick={handleStartEdit}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Click to quick-edit stock"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="inline-flex items-center gap-1 text-xs text-destructive font-medium mt-0.5"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
