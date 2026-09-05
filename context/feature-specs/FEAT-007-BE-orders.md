# FEAT-007-BE — Order Query & Receipt Service
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & Order Retrieval

## Goal
Provide secure order retrieval for confirmed receipts (both logged-in users and guest token lookup) and customer order history querying.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`, `FEAT-006-INT-stripe-webhook.md`
- **Context pack**:
```typescript
import { Order, OrderItem, ProductVariant, Product, ApiResponse, PaginatedResult } from "@/types";

export interface HydratedOrderItem extends OrderItem {
  variant: ProductVariant & { product: Product };
}

export interface HydratedOrder extends Order {
  items: HydratedOrderItem[];
}
```

## Provides / Exposes
```typescript
export async function getOrderByNumber(orderNumber: string, guestEmail?: string, userId?: string): Promise<ApiResponse<HydratedOrder>>;
export async function getUserOrders(userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResult<HydratedOrder>>>;

// Route Handlers:
// GET /api/orders/:orderNumber?guestEmail=...
// GET /api/account/orders?page=...&limit=...
```

## Scope (In)
- Fetch order by unique `orderNumber` with item details, product titles, variant names, and shipping address.
- Access control: allow order access if order belongs to authenticated `userId` or matches `guestEmail`.
- Paginated customer order history endpoint.

## Scope (Out)
- Admin order status management (covered in `FEAT-009-BE-admin-orders.md`).
- Frontend order confirmation page (covered in `FEAT-007-FE-orders.md`).

## Tech / Files to Touch
- `src/lib/services/orders.ts`
- `src/app/api/orders/[orderNumber]/route.ts`
- `src/app/api/account/orders/route.ts`

## Tests to Write FIRST
1. `tests/unit/order-access-control.test.ts`: Prevents User B from querying User A's order without matching email/token.
2. `tests/api/order-detail.test.ts`: Returns full order receipt with item breakdown and address for valid `orderNumber`.
3. `tests/api/account-order-history.test.ts`: Returns paginated list of orders for authenticated user.

## Implementation Steps
1. Implement `getOrderByNumber` in `src/lib/services/orders.ts` with user/email validation.
2. Implement `getUserOrders` for paginated customer history.
3. Build route handler in `src/app/api/orders/[orderNumber]/route.ts`.
4. Build route handler in `src/app/api/account/orders/route.ts`.

## Acceptance Criteria
- [ ] Querying with matching `orderNumber` and valid auth session returns complete order object.
- [ ] Attempting to access an order belonging to another user without valid guest email returns HTTP `403 FORBIDDEN`.
- [ ] Customer order history returns orders sorted in descending order of `createdAt`.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] TypeScript build clean with zero errors.

## Edge Cases to Handle
- Nonexistent `orderNumber` returns HTTP `404 NOT_FOUND`.
- Missing parameters return HTTP `400`.

## Pre-flight Check
- Confirm `FEAT-006-VERIFY-payments.md` has passed.

## What's Next
- `FEAT-007-FE-orders.md` (Order Confirmation & History UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-007-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
