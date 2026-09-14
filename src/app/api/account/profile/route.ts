import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser, updateProfile } from "@/lib/services/auth-service";
import { updateProfileSchema } from "@/lib/validators/auth";
import { apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const result = await getCurrentUser(session.user.id);

    if (!result.success) {
      const status = result.error?.code === "USER_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile payload",
            details: parsed.error.flatten().fieldErrors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await updateProfile(session.user.id, parsed.data);

    if (!result.success) {
      const status = result.error?.code === "USER_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
