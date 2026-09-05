# FEAT-009-BE — Admin Order Processing API
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & Admin Operations

## Goal
Provide admin order list querying, status transition mutations (`PROCESSING` -> `SHIPPED` -> `DELIVERED` / `CANCELLED`), and store summary metrics.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Order, OrderStatus, ApiResponse, PaginatedResult } from "@/types";

export interface AdminOrderMetrics {
  totalRevenue: number;
  totalOrders: number;
  processingOrders: number;
  deliveredOrders: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
```

## Provides / Exposes
```typescript
export async function getAdminOrders(status?: OrderStatus, page?: number, limit?: number): Promise<ApiResponse<PaginatedResult<Order>>>;
export async function updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<ApiResponse<Order>>;
export async function getAdminMetrics(): Promise<ApiResponse<AdminOrderMetrics>>;

// Route Handlers:
// GET   /api/admin/orders?status=...&page=...
// PATCH /api/admin/orders/:id/status -> updateOrderStatus
// GET   /api/admin/metrics -> getAdminMetrics
```

## Scope (In)
- Admin-only access enforcement via `requireAdmin()`.
- Filter orders by `OrderStatus` and paginate results.
- Transition order status with validation (e.g. cannot transition `CANCELLED` order to `DELIVERED`).
- Aggregate sales revenue, order counts, and active order counts.

## Scope (Out)
- Automatic shipping label printing integration (Phase 3).

## Tech / Files to Touch
- `src/lib/services/admin-orders.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/orders/[id]/status/route.ts`
- `src/app/api/admin/metrics/route.ts`

## Tests to Write FIRST
1. `tests/api/admin-orders-auth.test.ts`: Requires admin session; returns 403 for regular customer.
2. `tests/api/admin-order-status-transition.test.ts`: Updates order status to `SHIPPED`; rejects invalid status transition.
3. `tests/unit/admin-metrics-calc.test.ts`: Calculates revenue and order counts correctly from seed data.

## Implementation Steps
1. Implement `getAdminOrders` with Prisma filtering in `src/lib/services/admin-orders.ts`.
2. Implement `updateOrderStatus` with state validation invariants.
3. Implement `getAdminMetrics` computing total revenue and counts.
4. Add route handlers in `src/app/api/admin/`.

## Acceptance Criteria
- [ ] Admin can retrieve paginated orders filtered by status.
- [ ] Updating order status updates `updatedAt` timestamp and returns updated order.
- [ ] Invalid order status transitions return HTTP `400 INVALID_STATUS_TRANSITION`.
- [ ] Store metrics accurately sum paid order subtotals.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] TypeScript check passes with zero errors.

## Edge Cases to Handle
- Updating a nonexistent order ID returns HTTP `404`.
- Handling cancel action when payment has already succeeded.

## Pre-flight Check
- Confirm `000-shared-contracts.md` Order model is active.

## What's Next
- `FEAT-009-FE-admin-orders.md` (Admin Orders UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-009-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
