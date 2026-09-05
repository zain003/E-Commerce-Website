# FEAT-009-FE — Admin Orders UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Admin Dashboard

## Goal
Build admin order management interface (`/admin/orders`) with status filter tabs, status transition controls, customer details inspector, and KPI overview cards.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-009-BE-admin-orders.md`
- **Context pack**:
```typescript
import { AdminOrderMetrics, UpdateOrderStatusDto } from "./FEAT-009-BE-admin-orders";
import { Order, OrderStatus, PaginatedResult } from "@/types";
```
- **Consumes**:
  - `GET /api/admin/orders` -> `getAdminOrders(status, page)`
  - `PATCH /api/admin/orders/:id/status` -> `updateOrderStatus(id, dto)`
  - `GET /api/admin/metrics` -> `getAdminMetrics()`

## Scope (In)
- KPI metric overview cards (Total Revenue, Total Orders, Pending Processing, Delivered).
- Filterable orders data table with customer name, items count, total, payment status, and date.
- Quick status change dropdown selector per order row.
- Order details inspection drawer showing item list and shipping address.

## Scope (Out)
- PDF packing slip generator (Phase 3).

## Tech / Files to Touch
- `src/app/admin/orders/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/components/admin/order-table.tsx`
- `src/components/admin/order-details-drawer.tsx`
- `src/components/admin/metrics-cards.tsx`

## Tests to Write FIRST
1. `tests/ui/admin-metrics-cards.test.tsx`: Renders revenue and orders counts formatted correctly.
2. `tests/ui/admin-order-table.test.tsx`: Renders order rows and responds to status filter tabs.
3. `tests/ui/admin-status-dropdown.test.tsx`: Selecting new status triggers API mutation and updates UI.

## Implementation Steps
1. Build `MetricsCards` component displaying summary stats.
2. Build `OrderTable` with status filter buttons (All, Processing, Shipped, Delivered, Cancelled).
3. Build `OrderDetailsDrawer` showing customer details and purchased items.
4. Assemble `/admin/orders` and `/admin/dashboard` pages.

## Acceptance Criteria
- [ ] Admin dashboard displays revenue, total orders, and active processing count cards.
- [ ] Changing order status via dropdown immediately reflects in the table status badge.
- [ ] Clicking an order row opens the order details drawer.
- [ ] Non-admin users are restricted from viewing the dashboard.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Responsive design functions cleanly on desktop and tablet views.

## Edge Cases to Handle
- High volume orders list handles pagination smoothly.
- Handling network failure gracefully during status change with toast notification.

## Pre-flight Check
- Confirm `FEAT-009-BE-admin-orders.md` endpoints are operational.

## What's Next
- `FEAT-009-VERIFY-admin-orders.md` (Admin Orders Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-009-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
