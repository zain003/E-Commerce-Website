import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/services/auth-service";
import { registerSchema } from "@/lib/validators/auth";
import { apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid registration payload",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await registerUser(validated.data);

    if (!result.success) {
      const status = result.error?.code === "EMAIL_EXISTS" ? 409 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
