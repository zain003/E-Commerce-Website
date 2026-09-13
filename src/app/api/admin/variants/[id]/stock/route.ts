import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateVariantStock } from "@/lib/services/admin-products";
import { updateVariantStockSchema } from "@/lib/validators/admin-product";
import { apiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (session.user.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    const { id } = await params;
    if (!id) {
      return apiError("BAD_REQUEST", "Variant ID is required", 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Malformed JSON payload", 400);
    }

    const validatedBody = updateVariantStockSchema.safeParse(body);
    if (!validatedBody.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid stock payload",
        400,
        validatedBody.error.flatten().fieldErrors
      );
    }

    const result = await updateVariantStock(id, validatedBody.data.stock);

    if (!result.success) {
      if (result.error?.code === "NOT_FOUND") {
        return NextResponse.json(result, { status: 404 });
      }
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/admin/variants/[id]/stock] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
