"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/product-table";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import type { AdminProduct, Category, Product } from "@/types";

export interface AdminProductsManagerProps {
  initialProducts: AdminProduct[];
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AdminProductsManager({
  initialProducts,
  categories,
  total,
  page,
  limit,
  totalPages,
}: AdminProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const refreshProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?page=${page}&limit=${limit}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setProducts(json.data.items);
      } else {
        router.refresh();
      }
    } catch {
      router.refresh();
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod: AdminProduct) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedProduct: Product) => {
    refreshProducts();
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/admin/products?page=${newPage}&limit=${limit}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your store catalog, SKU variants, prices, and live stock.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreateProduct}
          className="inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Main Product Table */}
      <ProductTable
        products={products}
        categories={categories}
        onEdit={handleEditProduct}
        onRefresh={refreshProducts}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Product Form Modal (Create & Edit) */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
