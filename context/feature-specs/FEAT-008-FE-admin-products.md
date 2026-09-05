# FEAT-008-FE — Admin Product Management UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Admin Tables

## Goal
Build admin product catalog table, product creation/editing modal forms, and inline inventory quantity controls.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-008-BE-admin-products.md`
- **Context pack**:
```typescript
import { CreateProductDto, UpdateProductDto } from "./FEAT-008-BE-admin-products";
import { Product, PaginatedResult } from "@/types";
```
- **Consumes**:
  - `GET /api/admin/products` -> `getAdminProducts()`
  - `POST /api/admin/products` -> `createAdminProduct(dto)`
  - `PATCH /api/admin/products/:id` -> `updateAdminProduct(id, dto)`
  - `PATCH /api/admin/variants/:id/stock` -> `updateVariantStock(id, stock)`

## Scope (In)
- Admin products data table (`/admin/products`) with search, filter, and pagination.
- Create/Edit Product dialog with title, slug generator, description, category selector, and variant rows (SKU, name, priceDelta, stock).
- Inline quick stock adjustment input.
- Archive toggle switch with confirmation dialog.

## Scope (Out)
- Admin analytics dashboards (covered in `FEAT-009-FE-admin-orders.md`).

## Tech / Files to Touch
- `src/app/admin/products/page.tsx`
- `src/components/admin/product-table.tsx`
- `src/components/admin/product-form-modal.tsx`
- `src/components/admin/stock-quick-edit.tsx`

## Tests to Write FIRST
1. `tests/ui/admin-product-table.test.tsx`: Renders product rows, prices, and stock indicators.
2. `tests/ui/admin-product-form.test.tsx`: Validates form fields and submits payload to API.
3. `tests/ui/admin-stock-edit.test.tsx`: Inline stock change triggers API update on blur/enter.

## Implementation Steps
1. Build `ProductTable` with column sorting and action buttons.
2. Build `ProductFormModal` with dynamic variant rows (Add/Remove variant).
3. Build `StockQuickEdit` component.
4. Assemble `/admin/products` page protected by admin session check.

## Acceptance Criteria
- [ ] Admin products table shows thumbnail, product name, category, total stock, and status.
- [ ] Creating product with empty fields triggers inline field-level validation messages.
- [ ] Changing inline stock value immediately persists to database.
- [ ] Non-admin users are redirected to login or unauthorized page.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Zero TypeScript errors.

## Edge Cases to Handle
- Adding multiple variants with duplicate SKUs displays immediate error.
- Very high stock numbers (e.g., > 10,000) format cleanly.

## Pre-flight Check
- Confirm `FEAT-008-BE-admin-products.md` provides operational CRUD endpoints.

## What's Next
- `FEAT-008-VERIFY-admin-products.md` (Admin Products Verification).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-008-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
