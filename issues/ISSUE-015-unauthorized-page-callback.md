# ISSUE-015: 403 Unauthorized Page Hardcodes Callback URL to /admin/products

## Summary
The 403 Access Denied page (`src/app/unauthorized/page.tsx`) contains a "Sign in as Admin" button that hardcodes the login callback URL to `/admin/products`. If an administrator was attempting to access `/admin/dashboard` or `/admin/orders`, they are unexpectedly redirected to the products list instead.

## Location / Flow
Access Denied Page → `src/app/unauthorized/page.tsx` (line 35).

## Steps to Reproduce
1. Sign in as a regular customer (`CUSTOMER` role).
2. Navigate directly to `/admin/orders`.
3. Notice you are redirected to `/unauthorized` (403 Access Denied).
4. On the 403 page, click the "Sign in as Admin" button.
5. Notice the destination is `/login?callbackUrl=/admin/products` instead of the original intended destination `/admin/orders` or the default `/admin/dashboard`.

## Expected Behavior
Per standard UX routing patterns, a 403 authorization fallback should either preserve the user's attempted callback destination or redirect to the root administrative overview `/admin/dashboard`.

## Actual Behavior
The button is statically configured as:
```tsx
<Link href="/login?callbackUrl=/admin/products">
  <Button ...>Sign in as Admin</Button>
</Link>
```

## Severity
Low

## Scope
- **In Scope:** Changing the fallback callback URL in `src/app/unauthorized/page.tsx` to `/admin/dashboard` or reading `callbackUrl` from search params if present.
- **Out of Scope:** Redesigning the 403 page layout.

## Acceptance Criteria
- [x] Clicking "Sign in as Admin" on `/unauthorized` directs to `/login?callbackUrl=/admin/dashboard` (or preserves the user's attempted route).
- [x] Successfully logging in as an admin redirects to the dashboard rather than products by default.

## Related Feature ID
FEAT-001 — Authentication & Profiles, FEAT-008 — Admin Catalog Management

## Notes
A minor routing polish issue, but causes disorientation for store managers trying to review orders.
