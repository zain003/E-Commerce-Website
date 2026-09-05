# FEAT-008-BE — Admin Product CRUD & Revalidation
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & Next.js 16 Cache Revalidation

## Goal
Provide admin-only product and variant CRUD operations, inventory adjustments, and immediate Next.js 16 cache invalidation using `revalidateTag()`.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Product, ProductVariant, ApiResponse, PaginatedResult } from "@/types";

export interface CreateProductDto {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  featured?: boolean;
  variants: Array<{
    sku: string;
    name: string;
    priceDelta: number;
    stock: number;
  }>;
}

export type UpdateProductDto = Partial<CreateProductDto> & { isArchived?: boolean };
```

## Provides / Exposes
```typescript
export async function createAdminProduct(dto: CreateProductDto): Promise<ApiResponse<Product>>;
export async function updateAdminProduct(id: string, dto: UpdateProductDto): Promise<ApiResponse<Product>>;
export async function updateVariantStock(variantId: string, stock: number): Promise<ApiResponse<ProductVariant>>;
export async function getAdminProducts(page?: number, limit?: number): Promise<ApiResponse<PaginatedResult<Product>>>;

// Route Handlers:
// GET   /api/admin/products
// POST  /api/admin/products -> createAdminProduct
// PATCH /api/admin/products/:id -> updateAdminProduct
// PATCH /api/admin/variants/:id/stock -> updateVariantStock
```

## Scope (In)
- Enforce strict `ADMIN` role check on all mutations via `requireAdmin()`.
- Create product with nested variants in single Prisma transaction.
- Update product details, archive toggle (`isArchived: true`), and stock counts.
- Trigger `revalidateTag("products")` upon mutation to instantly refresh cached storefront reads.

## Scope (Out)
- Admin UI forms and tables (covered in `FEAT-008-FE-admin-products.md`).
- S3/Cloudinary direct image uploads (image URL strings stored in DB).

## Tech / Files to Touch
- `src/lib/services/admin-products.ts`
- `src/lib/validators/admin-product.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/variants/[id]/stock/route.ts`

## Tests to Write FIRST
1. `tests/api/admin-auth-guard.test.ts`: Non-admin role returns HTTP `403 FORBIDDEN`.
2. `tests/api/admin-product-crud.test.ts`: Creates product with variants; updates details; triggers `revalidateTag`.
3. `tests/unit/admin-product-validator.test.ts`: Rejects negative price or empty SKU.

## Implementation Steps
1. Create Zod validation schemas in `src/lib/validators/admin-product.ts`.
2. Implement admin service in `src/lib/services/admin-products.ts` with `requireAdmin` checks.
3. Call `revalidateTag("products")` in Next.js 16 after mutations.
4. Build API route handlers in `src/app/api/admin/products/`.

## Acceptance Criteria
- [ ] Requests without `role: ADMIN` receive HTTP `403 FORBIDDEN`.
- [ ] Creating product with duplicate slug returns HTTP `409 CONFLICT`.
- [ ] Stock adjustments update the `ProductVariant.stock` column immediately.
- [ ] Cache tag `products` is invalidated on every product create or update.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] TypeScript check passes with 0 errors.

## Edge Cases to Handle
- Deleting/Archiving product currently in pending orders sets `isArchived: true` without deleting historical records.

## Pre-flight Check
- Confirm `000-shared-contracts.md` Role and Category models are configured.

## What's Next
- `FEAT-008-FE-admin-products.md` (Admin Product Management UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-008-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
