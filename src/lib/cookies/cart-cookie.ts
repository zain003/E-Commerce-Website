import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const CART_COOKIE_NAME = "guest_cart_token";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Generates a cryptographically random UUID for guest cart sessions.
 */
export function generateGuestToken(): string {
  return crypto.randomUUID();
}

/**
 * Retrieves the guest cart token from HTTP-only cookies in Next.js 16.
 */
export async function getGuestCartToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(CART_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

/**
 * Sets the HTTP-only guest cart token cookie.
 */
export async function setGuestCartToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(CART_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  } catch {
    // Handled by response attachment if cookieStore is read-only
  }
}

/**
 * Clears/deletes the guest cart token cookie.
 */
export async function deleteGuestCartToken(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CART_COOKIE_NAME);
  } catch {
    // Handled by response attachment if cookieStore is read-only
  }
}

/**
 * Explicitly attaches the guest cart token cookie to a NextResponse instance.
 */
export function attachGuestCartCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set(CART_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Explicitly clears the guest cart token cookie from a NextResponse instance.
 */
export function clearGuestCartCookie(response: NextResponse): NextResponse {
  response.cookies.set(CART_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
