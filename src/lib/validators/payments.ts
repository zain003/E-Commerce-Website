import { z } from "zod";
import { CreatePaymentIntentDto } from "@/types";
import {
  checkoutSessionSchema,
  validateCheckoutSessionInput,
  ValidationResult,
} from "./checkout";

export const createPaymentIntentSchema = z.object({
  checkoutSession: checkoutSessionSchema,
  idempotencyKey: z.string().trim().min(1).max(255).optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

/**
 * Validates payment intent creation payload including guest email requirements and phone formatting.
 */
export function validateCreatePaymentIntentInput(
  input: unknown,
  isGuest: boolean
): ValidationResult<CreatePaymentIntentDto> {
  const result = createPaymentIntentSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);

      // Also map leaf key for convenience
      const leafKey = issue.path[issue.path.length - 1];
      if (typeof leafKey === "string" && !fieldErrors[leafKey]) {
        fieldErrors[leafKey] = [issue.message];
      }
    }

    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payment intent payload",
        details: fieldErrors,
      },
    };
  }

  // Next, validate checkout session specifics (including guestEmail presence when isGuest is true)
  const sessionValidation = validateCheckoutSessionInput(
    result.data.checkoutSession,
    isGuest
  );

  if (!sessionValidation.success || !sessionValidation.data) {
    return {
      success: false,
      error: sessionValidation.error,
    };
  }

  return {
    success: true,
    data: {
      checkoutSession: sessionValidation.data,
      idempotencyKey: result.data.idempotencyKey,
    },
  };
}
