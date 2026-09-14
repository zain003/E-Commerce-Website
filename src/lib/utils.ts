import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Recursively converts Prisma Decimal objects to standard numbers and transforms
 * objects into plain JavaScript objects so they can be safely passed from
 * React Server Components to Client Components across the RSC serialization boundary.
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Prisma Decimal or objects with .toNumber()
  if (
    typeof data === "object" &&
    "toNumber" in data &&
    typeof (data as { toNumber: () => number }).toNumber === "function"
  ) {
    return (data as { toNumber: () => number }).toNumber() as unknown as T;
  }

  // Preserve Date instances (React 19 RSC natively supports Date)
  if (data instanceof Date) {
    return data;
  }

  // Handle arrays recursively
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  // Handle objects by shallow-copying into a plain object literal
  if (typeof data === "object") {
    const plainObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      plainObj[key] = serializeData(value);
    }
    return plainObj as T;
  }

  return data;
}

