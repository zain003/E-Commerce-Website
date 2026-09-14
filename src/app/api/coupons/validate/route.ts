import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { validateCouponSchema } from "@/lib/validators/coupon";
import { validateCoupon } from "@/lib/services/coupons";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid JSON payload", 400);
    }

    const validated = validateCouponSchema.safeParse(body);
    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid coupon validation request",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await validateCoupon(validated.data);

    if (!result.success) {
      const status = result.error?.code === "INTERNAL_SERVER_ERROR" ? 500 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[POST /api/coupons/validate] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
