import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/services/admin-orders";
import { updateOrderStatusSchema } from "@/lib/validators/admin-orders";
import { apiError } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (session.user.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    const { id } = await context.params;
    if (!id || id.trim() === "") {
      return apiError("BAD_REQUEST", "Order ID is required", 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Malformed JSON payload", 400);
    }

    const validatedBody = updateOrderStatusSchema.safeParse(body);
    if (!validatedBody.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid order status payload",
        400,
        validatedBody.error.flatten().fieldErrors
      );
    }

    const result = await updateOrderStatus(id, validatedBody.data);

    if (!result.success) {
      if (result.error?.code === "NOT_FOUND") {
        return NextResponse.json(result, { status: 404 });
      }
      if (result.error?.code === "INVALID_STATUS_TRANSITION") {
        return NextResponse.json(result, { status: 400 });
      }
      if (result.error?.code === "BAD_REQUEST") {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`[PATCH /api/admin/orders/:id/status] Error:`, error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
