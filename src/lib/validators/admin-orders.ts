import { z } from "zod";

export const adminOrderStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const adminOrderQuerySchema = z.object({
  status: z
    .enum([
      "PENDING_PAYMENT",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "ALL",
    ])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateOrderStatusSchema = z.object({
  status: adminOrderStatusEnum,
});

export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
