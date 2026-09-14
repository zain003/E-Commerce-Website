# ISSUE-004: 404 Not Found Error on /admin Root Route

## Summary
Navigating directly to `/admin` returns an unhandled 404 Not Found error because no `src/app/admin/page.tsx` exists. Admin pages only exist under `/admin/dashboard`, `/admin/products`, and `/admin/orders`.

## Location / Flow
Route `/admin` (`src/app/admin/`).

## Steps to Reproduce
1. Start the application (`npm run dev`).
2. Type or navigate to `http://localhost:3000/admin` in the browser address bar.
3. Observe the result.

## Expected Behavior
Per `context/architecture.md` (System Boundaries: "`src/app/admin/` — Back-office admin dashboard and product/order management pages"), requesting the root administrative URL `/admin` should cleanly redirect to `/admin/dashboard` (or prompt for login if unauthenticated).

## Actual Behavior
The Next.js router returns a default 404 Not Found error page because there is no page component or route redirect handler mapped to `/admin`.

## Severity
Medium

## Scope
- **In Scope:** Adding `src/app/admin/page.tsx` that performs a server-side redirect to `/admin/dashboard` (with session/role checks).
- **Out of Scope:** Modifying `/admin/dashboard` or other existing subroutes.

## Acceptance Criteria
- [x] Navigating to `/admin` automatically redirects to `/admin/dashboard`.
- [x] If unauthenticated, redirect targets `/login?callbackUrl=/admin/dashboard`.
- [x] If authenticated as a non-admin, redirect targets `/unauthorized`.
- [x] No 404 error occurs when accessing `/admin`.

## Related Feature ID
FEAT-008 — Admin Catalog Management, FEAT-009 — Admin Orders Dashboard

## Notes
Most users and staff members naturally attempt to access the administrative section by entering `/admin`.
