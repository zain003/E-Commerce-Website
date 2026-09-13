"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  Layers,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { StockQuickEdit } from "@/components/admin/stock-quick-edit";
import type { AdminProduct, Category } from "@/types";

export interface ProductTableProps {
  products: AdminProduct[];
  categories: Category[];
  onEdit: (product: AdminProduct) => void;
  onRefresh: () => void;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

type SortField = "name" | "price" | "stock" | "date";
type SortDirection = "asc" | "desc";

export function ProductTable({
  products,
  categories,
  onEdit,
  onRefresh,
  total,
  page = 1,
  totalPages = 1,
  onPageChange,
}: ProductTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Expanded Variant Rows
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set()
  );

  // Archive Confirmation Modal State
  const [confirmProduct, setConfirmProduct] = useState<AdminProduct | null>(
    null
  );
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Status filter
        if (selectedStatus === "active" && p.isArchived) return false;
        if (selectedStatus === "archived" && !p.isArchived) return false;

        // Category filter
        if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = p.name.toLowerCase().includes(q);
          const slugMatch = p.slug.toLowerCase().includes(q);
          const skuMatch = p.variants?.some((v) =>
            v.sku.toLowerCase().includes(q)
          );
          if (!nameMatch && !slugMatch && !skuMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === "name") {
          compare = a.name.localeCompare(b.name);
        } else if (sortField === "price") {
          const priceA = Number(a.basePrice) || 0;
          const priceB = Number(b.basePrice) || 0;
          compare = priceA - priceB;
        } else if (sortField === "stock") {
          const stockA =
            a.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
          const stockB =
            b.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
          compare = stockA - stockB;
        } else if (sortField === "date") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          compare = dateA - dateB;
        }
        return sortDirection === "asc" ? compare : -compare;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  // Handle Archive / Restore toggle
  const handleConfirmArchiveToggle = async () => {
    if (!confirmProduct) return;

    setIsArchiving(true);
    setArchiveError(null);

    try {
      const newArchivedStatus = !confirmProduct.isArchived;
      const res = await fetch(`/api/admin/products/${confirmProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: newArchivedStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || "Failed to update archive status"
        );
      }

      setConfirmProduct(null);
      onRefresh();
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : "Failed to toggle archive status"
      );
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-xl border border-border bg-card">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or SKU..."
            className="pl-9 h-10 w-full"
            aria-label="Search products or SKU"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="category-filter"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Category:
            </label>
            <select
              id="category-filter"
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="status-filter"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Status:
            </label>
            <select
              id="status-filter"
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    aria-label="Sort by price"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Base Price
                    {sortField === "price" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort("stock")}
                    aria-label="Sort by stock"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Total Stock
                    {sortField === "stock" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <p className="font-medium">No products found</p>
                      <p className="text-xs">
                        Try adjusting your search filters or add a new product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map((product) => {
                  const totalStock =
                    product.variants?.reduce(
                      (acc, v) => acc + (v.stock || 0),
                      0
                    ) || 0;
                  const isExpanded = expandedProductIds.has(product.id);
                  const firstImage = product.images?.[0];

                  return (
                    <React.Fragment key={product.id}>
                      <tr
                        data-testid="product-row"
                        className={`hover:bg-muted/30 transition-colors ${
                          product.isArchived ? "opacity-75 bg-muted/10" : ""
                        }`}
                      >
                        {/* Expand toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleExpand(product.id)}
                            aria-label={`View variants for ${product.name}`}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>

                        {/* Product Info (Thumbnail + Title + Slug) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  alt={product.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                                  {product.name}
                                </span>
                                {product.featured && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground font-mono block truncate max-w-[200px]">
                                /{product.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {product.category?.name || "Uncategorized"}
                          </Badge>
                        </td>

                        {/* Base Price */}
                        <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                          ${Number(product.basePrice).toFixed(2)}
                        </td>

                        {/* Total Stock */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-mono font-medium text-foreground">
                              {totalStock.toLocaleString()}
                            </span>
                            {totalStock === 0 ? (
                              <Badge
                                variant="destructive"
                                className="text-[10px] px-1.5 py-0"
                              >
                                Out of stock
                              </Badge>
                            ) : totalStock < 10 ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 text-amber-700 bg-amber-50 border-amber-200"
                              >
                                Low stock
                              </Badge>
                            ) : null}
                          </div>
                        </td>

                        {/* Variants Count */}
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground/70" />
                            {product.variants?.length || 0} variant
                            {product.variants?.length === 1 ? "" : "s"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {product.isArchived ? (
                            <Badge variant="destructive" className="text-xs">
                              Archived
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit product ${product.name}`}
                              onClick={() => onEdit(product)}
                              className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={
                                product.isArchived
                                  ? `Restore product ${product.name}`
                                  : `Archive product ${product.name}`
                              }
                              onClick={() => setConfirmProduct(product)}
                              className={`h-8 w-8 p-0 cursor-pointer ${
                                product.isArchived
                                  ? "text-emerald-600 hover:text-emerald-700"
                                  : "text-muted-foreground hover:text-destructive"
                              }`}
                              title={
                                product.isArchived
                                  ? "Restore product"
                                  : "Archive product"
                              }
                            >
                              {product.isArchived ? (
                                <RotateCcw className="h-4 w-4" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Variants Row */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b border-border">
                          <td colSpan={8} className="py-3 px-6 sm:px-10">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Variants & Quick Inventory Stock:
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {product.variants?.map((variant) => (
                                  <div
                                    key={variant.id}
                                    className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between gap-2 shadow-2xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-foreground truncate">
                                        {variant.name}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground font-mono">
                                        {variant.sku}
                                      </p>
                                      {Number(variant.priceDelta) !== 0 && (
                                        <p className="text-[11px] text-muted-foreground">
                                          Delta: {Number(variant.priceDelta) > 0 ? "+" : ""}
                                          ${Number(variant.priceDelta).toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <StockQuickEdit
                                        variantId={variant.id}
                                        initialStock={variant.stock}
                                        variantName={variant.name}
                                        sku={variant.sku}
                                        onStockChange={() => onRefresh()}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing page {page} of {totalPages} ({total || products.length} total products)
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Archive / Restore Confirmation Modal */}
      {confirmProduct && (
        <Modal
          isOpen={Boolean(confirmProduct)}
          onClose={() => setConfirmProduct(null)}
          title={
            confirmProduct.isArchived
              ? `Restore ${confirmProduct.name}?`
              : `Archive ${confirmProduct.name}?`
          }
          description={
            confirmProduct.isArchived
              ? "Restoring this product will make it publicly visible again in the customer storefront catalog and search."
              : "Archiving this product will hide it from the storefront and customer searches. Historical order receipts will remain intact."
          }
          className="max-w-md"
        >
          <div className="space-y-4 pt-2">
            {archiveError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{archiveError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmProduct(null)}
                disabled={isArchiving}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmProduct.isArchived ? "default" : "destructive"}
                onClick={handleConfirmArchiveToggle}
                disabled={isArchiving}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                {isArchiving && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmProduct.isArchived
                  ? "Confirm Restore"
                  : "Confirm Archive"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
