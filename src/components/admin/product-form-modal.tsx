"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, AdminProduct, Product, CreateProductVariantDto } from "@/types";

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  categories: Category[];
  onSuccess: (product: Product) => void;
}

interface VariantFormState {
  sku: string;
  name: string;
  priceDelta: number;
  stock: number;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(product && product.id);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<string>("0.00");
  const [categoryId, setCategoryId] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantFormState[]>([
    { sku: "", name: "", priceDelta: 0, stock: 0 },
  ]);

  // Errors & UI states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateSkuError, setDuplicateSkuError] = useState<string | null>(null);

  // Initialize or reset form when product prop or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || "");
        setSlug(product.slug || "");
        setDescription(product.description || "");
        setBasePrice(product.basePrice ? String(product.basePrice) : "0.00");
        setCategoryId(product.categoryId || "");
        setImagesText(product.images ? product.images.join("\n") : "");
        setFeatured(Boolean(product.featured));

        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              priceDelta: Number(v.priceDelta) || 0,
              stock: v.stock || 0,
            }))
          );
        } else {
          setVariants([{ sku: "", name: "", priceDelta: 0, stock: 0 }]);
        }
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setBasePrice("0.00");
        setCategoryId("");
        setImagesText("");
        setFeatured(false);
        setVariants([{ sku: "", name: "", priceDelta: 0, stock: 0 }]);
      }
      setFieldErrors({});
      setServerError(null);
      setDuplicateSkuError(null);
    }
  }, [isOpen, product, categories]);

  // Check duplicate SKUs whenever variants change
  useEffect(() => {
    const seenSkus = new Set<string>();
    let duplicateFound: string | null = null;

    for (const v of variants) {
      const trimmedSku = v.sku.trim().toUpperCase();
      if (!trimmedSku) continue;
      if (seenSkus.has(trimmedSku)) {
        duplicateFound = trimmedSku;
        break;
      }
      seenSkus.add(trimmedSku);
    }

    if (duplicateFound) {
      setDuplicateSkuError(`Duplicate SKU detected: "${duplicateFound}". All variant SKUs must be unique.`);
    } else {
      setDuplicateSkuError(null);
    }
  }, [variants]);

  const handleSlugGenerate = () => {
    if (!name) return;
    const generated = generateSlug(name);
    setSlug(generated);
    if (fieldErrors.slug) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.slug;
        return next;
      });
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: "", name: "", priceDelta: 0, stock: 0 },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormState,
    value: string | number
  ) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });

    if (fieldErrors[`variant_${index}_${field}`]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[`variant_${index}_${field}`];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Product name is required";
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    }

    const parsedPrice = parseFloat(basePrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.basePrice = "Base price cannot be negative";
    }

    if (!categoryId.trim()) {
      errors.categoryId = "Category is required";
    }

    if (variants.length === 0) {
      errors.variants = "At least one variant is required";
    }

    // Check individual variant fields
    variants.forEach((v, idx) => {
      if (!v.sku.trim()) {
        errors[`variant_${idx}_sku`] = "SKU is required";
      }
      if (!v.name.trim()) {
        errors[`variant_${idx}_name`] = "Variant name is required";
      }
      if (v.stock < 0) {
        errors[`variant_${idx}_stock`] = "Stock cannot be negative";
      }
    });

    if (duplicateSkuError) {
      errors.duplicateSku = duplicateSkuError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const images = imagesText
        .split("\n")
        .map((img) => img.trim())
        .filter(Boolean);

      const parsedPrice = parseFloat(basePrice) || 0;

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        basePrice: parsedPrice,
        categoryId: categoryId.trim(),
        images,
        featured,
        variants: variants.map((v) => ({
          sku: v.sku.trim(),
          name: v.name.trim(),
          priceDelta: Number(v.priceDelta) || 0,
          stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        })),
      };

      const endpoint = isEditing
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            (isEditing ? "Failed to update product" : "Failed to create product")
        );
      }

      onSuccess(json.data);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Create Product"}
      description={
        isEditing
          ? "Update product specifications, pricing, and variant inventory."
          : "Fill in the details below to add a new product with variants to your catalog."
      }
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {duplicateSkuError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{duplicateSkuError}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label
                htmlFor="product-name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Product Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                placeholder="e.g., Classic Denim Jacket"
                className={fieldErrors.name ? "border-destructive" : ""}
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="product-slug"
                  className="block text-sm font-medium text-foreground"
                >
                  Slug <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSlugGenerate}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate
                </button>
              </div>
              <Input
                id="product-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (fieldErrors.slug) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.slug;
                      return next;
                    });
                  }
                }}
                placeholder="e.g., classic-denim-jacket"
                className={fieldErrors.slug ? "border-destructive" : ""}
                aria-invalid={Boolean(fieldErrors.slug)}
              />
              {fieldErrors.slug && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.slug}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="product-category"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (fieldErrors.categoryId) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.categoryId;
                      return next;
                    });
                  }
                }}
                className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary ${
                  fieldErrors.categoryId ? "border-destructive" : "border-border"
                }`}
                aria-invalid={Boolean(fieldErrors.categoryId)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>

            {/* Base Price */}
            <div>
              <label
                htmlFor="product-base-price"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Base Price ($) <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-base-price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(e.target.value);
                  if (fieldErrors.basePrice) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.basePrice;
                      return next;
                    });
                  }
                }}
                placeholder="0.00"
                className={fieldErrors.basePrice ? "border-destructive" : ""}
                aria-invalid={Boolean(fieldErrors.basePrice)}
              />
              {fieldErrors.basePrice && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.basePrice}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.description;
                    return next;
                  });
                }
              }}
              placeholder="Provide a detailed product overview..."
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary ${
                fieldErrors.description ? "border-destructive" : "border-border"
              }`}
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Image URLs */}
          <div>
            <label
              htmlFor="product-images"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Image URLs (one per line)
            </label>
            <textarea
              id="product-images"
              rows={2}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="product-featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="product-featured"
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              Mark as Featured Product
            </label>
          </div>
        </div>

        {/* Dynamic Variants Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Product Variants
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each product requires at least one variant with a unique SKU.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {fieldErrors.variants && (
            <p className="text-xs text-destructive">{fieldErrors.variants}</p>
          )}

          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-border bg-muted/40 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
              >
                {/* SKU */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor={`variant-sku-${idx}`}
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    SKU <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id={`variant-sku-${idx}`}
                    aria-label={`SKU for variant ${idx + 1}`}
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantChange(idx, "sku", e.target.value)
                    }
                    placeholder="e.g., JKT-S"
                    className={`h-8 text-xs font-mono ${
                      fieldErrors[`variant_${idx}_sku`]
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  {fieldErrors[`variant_${idx}_sku`] && (
                    <p className="mt-0.5 text-[10px] text-destructive">
                      {fieldErrors[`variant_${idx}_sku`]}
                    </p>
                  )}
                </div>

                {/* Variant Name */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor={`variant-name-${idx}`}
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Variant Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id={`variant-name-${idx}`}
                    aria-label={`Variant Name for variant ${idx + 1}`}
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(idx, "name", e.target.value)
                    }
                    placeholder="e.g., Small / Black"
                    className={`h-8 text-xs ${
                      fieldErrors[`variant_${idx}_name`]
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  {fieldErrors[`variant_${idx}_name`] && (
                    <p className="mt-0.5 text-[10px] text-destructive">
                      {fieldErrors[`variant_${idx}_name`]}
                    </p>
                  )}
                </div>

                {/* Price Delta */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`variant-price-delta-${idx}`}
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Price Delta ($)
                  </label>
                  <Input
                    id={`variant-price-delta-${idx}`}
                    aria-label={`Price Delta for variant ${idx + 1}`}
                    type="number"
                    step="0.01"
                    value={variant.priceDelta}
                    onChange={(e) =>
                      handleVariantChange(
                        idx,
                        "priceDelta",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-8 text-xs"
                  />
                </div>

                {/* Stock */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor={`variant-stock-${idx}`}
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Stock
                  </label>
                  <Input
                    id={`variant-stock-${idx}`}
                    aria-label={`Stock for variant ${idx + 1}`}
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        idx,
                        "stock",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>

                {/* Remove action */}
                <div className="sm:col-span-1 flex items-end justify-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    disabled={variants.length <= 1}
                    aria-label={`Remove variant ${idx + 1}`}
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:hover:text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
                    title={
                      variants.length <= 1
                        ? "At least one variant is required"
                        : "Remove variant"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || Boolean(duplicateSkuError)}
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
