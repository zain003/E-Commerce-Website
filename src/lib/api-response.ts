import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export function apiSuccess<T>(data: T, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>
) {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}
