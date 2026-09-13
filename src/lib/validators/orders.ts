import { z } from "zod";

export const orderLookupQuerySchema = z.object({
  guestEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid guest email format")
    .optional(),
});

export type OrderLookupQuery = z.infer<typeof orderLookupQuerySchema>;

export const orderHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
});

export type OrderHistoryQuery = z.infer<typeof orderHistoryQuerySchema>;
