import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deleteAddress,
  createOrUpdateAddress,
} from "@/lib/services/auth-service";
import { addressSchema } from "@/lib/validators/auth";
import { apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = await context.params;

    const result = await deleteAddress(session.user.id, id);

    if (!result.success) {
      const status =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "FORBIDDEN"
          ? 403
          : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = await context.params;
    const body = await req.json();
    const validated = addressSchema.safeParse(body);

    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid address payload",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await createOrUpdateAddress(session.user.id, validated.data, id);

    if (!result.success) {
      const status =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "FORBIDDEN"
          ? 403
          : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
