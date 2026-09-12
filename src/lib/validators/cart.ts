import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity must be greater than or equal to 0"),
});

export const mergeCartSchema = z.object({
  guestToken: z.string().min(1, "Guest token cannot be empty").optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
