# ISSUE-003: Missing Admin Portal Entry Point for Authenticated Administrators

## Summary
When an administrator with the `ADMIN` role signs in, there is no navigation link, button, or banner in the storefront header, customer profile hub, or footer leading to the Admin Portal (`/admin/dashboard`). Administrators are forced to manually type the URL into their browser address bar.

## Location / Flow
Storefront Header (`src/app/(shop)/layout.tsx`) & Customer Profile View (`src/components/account/profile-view.tsx`).

## Steps to Reproduce
1. Sign in with an account having the `ADMIN` role.
2. Navigate to the storefront homepage `/` or account profile page `/account/profile`.
3. In `ProfileView`, observe the "Admin" badge displayed next to the user name.
4. Inspect the Account Hub quick navigation cards: only `Shipping Addresses`, `Order History`, and `Saved Wishlist` are present.
5. Inspect the storefront header and footer: no link to `/admin` or `/admin/dashboard` exists.

## Expected Behavior
Per `context/project-overview.md` (Administrator Flow 1: "Admin signs in with credentials; role is verified as ADMIN") and standard back-office administrative patterns, authenticated administrators should see an easily reachable link or CTA to navigate to `/admin/dashboard` from the header, account hub, or sticky bar.

## Actual Behavior
The UI recognizes the `ADMIN` role to render an informative badge in `ProfileView`, but renders zero interactive navigation links to access the admin dashboard or management views.

## Severity
High

## Scope
- **In Scope:** Adding an Admin Portal link/card in `ProfileView` for users where `user.role === "ADMIN"` and/or an Admin link in the header when an admin session is active.
- **Out of Scope:** Altering admin route protection (`requireAdmin`) or dashboard logic.

## Acceptance Criteria
- [ ] Users with `role === "ADMIN"` see a prominent "Admin Portal" link/card in `/account/profile` linking to `/admin/dashboard`.
- [ ] Non-admin customers (`role === "CUSTOMER"`) do not see the Admin Portal entry point.
- [ ] Clicking the link routes directly to `/admin/dashboard`.

## Related Feature ID
FEAT-008 — Admin Catalog Management, FEAT-009 — Admin Orders Dashboard

## Notes
While the Admin layout (`AdminNav`) provides a link back to the storefront (`Storefront` with `ExternalLink`), the storefront provides no reciprocal link back to the Admin area.
