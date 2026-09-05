# Code Standards

## General Principles
- **Single Responsibility**: Keep modules, components, and service functions small and focused on a single responsibility.
- **Fix Root Causes**: Never layer workarounds over broken contracts or failing tests; fix the underlying schema, validator, or logic.
- **Explicit Over Implicit**: Avoid magic strings and implicit fallbacks. Always define concrete types and constants.

---

## TypeScript Rules
- **Strict Mode**: `strict: true` in `tsconfig.json` is mandatory throughout the repository.
- **No `any` Types**: Explicit interfaces, generics, or narrowly scoped types (`unknown` with type guards) are required.
- **Boundary Validation**: Validate all untrusted external input (API route bodies, URL query parameters, cookies) with Zod schemas before running business logic.

---

## Next.js 16 & React 19 Standards
- **Server Components Default**: All components default to Server Components. Add `"use client"` only at the leaf level where browser state (hooks, event listeners) is required.
- **Async Route Params**: In Next.js 16, `params` and `searchParams` in page components and route handlers are asynchronous and must always be awaited:
  ```typescript
  export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // ...
  }
  ```
- **Explicit Cache Directives**: Data fetching functions intended for caching must include `"use cache"` and `cacheLife("hours")`.
- **Image Optimization**: Always use Next.js `<Image>` with explicit width/height or `fill` with `sizes` for responsive assets.

---

## Styling & Design Tokens
- **Design Tokens**: Use Tailwind CSS v4 custom property tokens defined in `src/app/globals.css` (e.g. `--background`, `--primary`, `--border`).
- **No Hardcoded Hex Values**: Never hardcode hex colors (e.g. `#3b82f6`) in JSX components; use semantic utility classes (e.g. `bg-primary`, `text-muted-foreground`).
- **Spacing Grid**: Adhere strictly to the 8px base spacing grid (`p-2`, `p-4`, `p-6`, `gap-4`).

---

## API Routes & Handlers
- **Envelope Standard**: All API route handlers must return the standard `ApiResponse<T>` JSON envelope:
  ```typescript
  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
  ```
- **Error Handling**: On failure, return proper HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`) with error payload:
  ```typescript
  return NextResponse.json(
    {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: formattedErrors },
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
  ```
- **Permission Guards**: Call `requireAuth()` or `requireAdmin()` at the start of any protected route handler before performing mutations.

---

## Database & Transactions
- **Relational Integrity**: Prisma models in `prisma/schema.prisma` represent the single source of truth for the database schema.
- **Atomic Operations**: Any multi-step mutation (such as creating an Order, updating stock, and clearing Cart items) must be wrapped in `prisma.$transaction([ ... ])`.
- **Decimal Precision**: Monetary values must use Prisma `@db.Decimal(10, 2)` and JavaScript Decimal/number conversions without floating point precision loss.

---

## File & Folder Organization
- `src/app/` — Next.js routing, layouts, and API route handlers.
- `src/components/ui/` — Base design system UI components.
- `src/components/[domain]/` — Feature-specific components (`product/`, `cart/`, `checkout/`, `orders/`, `admin/`).
- `src/lib/services/` — Server-side business logic and data access services.
- `src/lib/validators/` — Zod request and schema validators.
- `src/store/` — Zustand client state stores.
- `src/types/` — Global shared TypeScript types and contract definitions.
