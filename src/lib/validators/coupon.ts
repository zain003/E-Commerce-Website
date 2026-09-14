import { z } from "zod";

export const validateCouponSchema = z.object({
  code: z
    .string({ message: "Coupon code is required" })
    .trim()
    .min(1, "Coupon code is required"),
  cartSubtotal: z.coerce
    .number({ message: "Cart subtotal is required" })
    .min(0, "Cart subtotal cannot be negative"),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
