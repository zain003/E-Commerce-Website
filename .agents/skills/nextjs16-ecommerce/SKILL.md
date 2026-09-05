---
name: nextjs16-ecommerce
description: >-
  Provides patterns, conventions, and guidelines for building features in Next.js 16 (App Router),
  React 19.2, Tailwind CSS v4, and Prisma ORM for this e-commerce application.
  Use when writing server components, client components, cache components, route handlers, or Prisma queries.
---

# Next.js 16 & React 19 E-Commerce Implementation Patterns

## 1. Next.js 16 Breaking Changes & Standards

### Async Route Parameters & Search Parameters
In Next.js 16, `params` and `searchParams` are Promises:
```typescript
// app/(shop)/products/[slug]/page.tsx
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  // ...
}
```

### Cache Components (`"use cache"` & `cacheLife`)
Opt catalog reads into caching with explicit freshness profiles:
```typescript
import { cacheLife, revalidateTag } from "next/cache";

export async function getCachedProducts(categorySlug?: string) {
  "use cache";
  cacheLife("hours");
  return db.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug }, isArchived: false } : { isArchived: false },
    include: { variants: true },
  });
}

// In admin mutations:
export async function invalidateProducts() {
  revalidateTag("products");
}
```

## 2. API Response & Error Envelope Pattern
Always return the structured `ApiResponse<T>` envelope from Route Handlers:
```typescript
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

export function apiError(code: string, message: string, status = 400, details?: Record<string, string[]>) {
  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}
```

## 3. Server Components vs Client Components
- **Server Components**: Default for data fetching, static layout, and initial page rendering.
- **Client Components (`"use client"`)**: Use at the lowest leaf component for forms (`react-hook-form`), interactive buttons (Add-to-Cart, Wishlist), and Zustand state hooks.

## 4. Prisma Atomic Transactions
Wrap interdependent mutations in `prisma.$transaction`:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create order
  const order = await tx.order.create({ ... });
  // 2. Decrement stock
  for (const item of items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  // 3. Clear cart
  await tx.cartItem.deleteMany({ where: { cartId } });
  return order;
});
```
