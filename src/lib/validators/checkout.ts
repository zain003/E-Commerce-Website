import { z } from "zod";
import { CheckoutSessionDto } from "@/types";

// Phone regex allowing optional '+' at start, followed by digits, spaces, hyphens, dots, or parentheses
const phoneRegex = /^\+?[0-9\s\-().]+$/;

export const checkoutAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(12, "Postal code is too long")
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postal code format"),
  country: z.string().trim().min(2, "Country is required"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number is too long")
    .regex(phoneRegex, "Invalid phone number format")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
      { message: "Phone number must contain between 7 and 15 digits" }
    ),
  isDefault: z.boolean().optional().default(false),
});

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;

export const checkoutSessionSchema = z.object({
  shippingAddress: checkoutAddressSchema,
  shippingMethodId: z.enum(["STANDARD", "EXPRESS"], {
    message: "Shipping method must be STANDARD or EXPRESS",
  }),
  guestEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Validates checkout session payload with role/auth context (enforcing guestEmail for guest users).
 */
export function validateCheckoutSessionInput(
  input: unknown,
  isGuest: boolean
): ValidationResult<CheckoutSessionDto> {
  const result = checkoutSessionSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);

      // Also map leaf key for convenience (e.g. "phone" for "shippingAddress.phone")
      const leafKey = issue.path[issue.path.length - 1];
      if (typeof leafKey === "string" && !fieldErrors[leafKey]) {
        fieldErrors[leafKey] = [issue.message];
      }
    }

    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid checkout session data",
        details: fieldErrors,
      },
    };
  }

  const { shippingAddress, shippingMethodId, guestEmail } = result.data;

  if (isGuest && (!guestEmail || guestEmail.trim() === "")) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Guest email is required for unauthenticated checkout",
        details: {
          guestEmail: ["Guest email is required for unauthenticated checkout"],
        },
      },
    };
  }

  return {
    success: true,
    data: {
      shippingAddress,
      shippingMethodId,
      guestEmail: guestEmail && guestEmail.trim() !== "" ? guestEmail : undefined,
    },
  };
}
