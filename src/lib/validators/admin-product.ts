import { z } from "zod";

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Variant name is required"),
  priceDelta: z.number().default(0),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(1, "Description is required"),
  basePrice: z.number().min(0, "Base price cannot be negative"),
  categoryId: z.string().trim().min(1, "Category ID is required"),
  images: z.array(z.string()).default([]),
  featured: z.boolean().optional().default(false),
  variants: z
    .array(createVariantSchema)
    .min(1, "At least one variant is required"),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().trim().min(1, "Description is required").optional(),
  basePrice: z.number().min(0, "Base price cannot be negative").optional(),
  categoryId: z.string().trim().min(1, "Category ID is required").optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  variants: z.array(createVariantSchema).optional(),
});

export const updateVariantStockSchema = z.object({
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
});

export const adminProductQuerySchema = z.object({
  page: z
    .preprocess((val) => (val === undefined || val === null || val === "" ? 1 : Number(val)), z.number().int().min(1))
    .default(1),
  limit: z
    .preprocess((val) => (val === undefined || val === null || val === "" ? 10 : Number(val)), z.number().int().min(1).max(100))
    .default(10),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateVariantStockInput = z.infer<typeof updateVariantStockSchema>;
export type AdminProductQueryInput = z.infer<typeof adminProductQuerySchema>;
