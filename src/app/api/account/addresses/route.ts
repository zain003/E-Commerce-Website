import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrUpdateAddress } from "@/lib/services/auth-service";
import { addressSchema } from "@/lib/validators/auth";
import { apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

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

    const result = await createOrUpdateAddress(session.user.id, validated.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
