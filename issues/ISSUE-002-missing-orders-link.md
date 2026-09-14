# ISSUE-002: Missing Orders Link in Storefront Header, Mobile Navigation, and Footer

## Summary
There is no direct link to the customer's order history (`/account/orders`) anywhere in the storefront global header, mobile bottom navigation bar, or footer. Customers cannot access past orders or delivery receipts without manually navigating first to `/account/profile` or entering the URL directly.

## Location / Flow
Global Storefront Layout → Header Navigation & Mobile Bottom Bar (`src/app/(shop)/layout.tsx`).

## Steps to Reproduce
1. Navigate to the storefront homepage `/` as an authenticated customer.
2. Inspect the desktop header navigation links (`Catalog`, `Categories`, `Wishlist`, `Saved Addresses`). Notice "Orders" or "My Orders" is absent.
3. Inspect the mobile viewport bottom navigation bar (`Home`, `Search`, `Cart`, `Profile`). Notice "Orders" is absent.
4. Scroll down to the storefront footer. Notice "Orders" is absent.

## Expected Behavior
Per `context/project-overview.md` (Core Customer Shopping Flow step 5: "Customer receives instant order confirmation receipt with unique order number and tracks order status in `/account/orders`"), customers should have intuitive, direct access to view and track past orders from the main navigation or account navigation bar.

## Actual Behavior
The desktop header provides links to `Catalog`, `Categories`, `Wishlist`, and `Saved Addresses`, but completely omits `Orders`. The only in-app link to `/account/orders` is buried inside the `/account/profile` dashboard.

## Severity
High

## Scope
- **In Scope:** Adding an accessible navigation link to `/account/orders` in the header nav (or account dropdown) and storefront footer.
- **Out of Scope:** Altering order querying logic or modifying `/account/orders` page implementation.

## Acceptance Criteria
- [x] Customers can access `/account/orders` directly from the global navigation (e.g., header, user menu, or footer).
- [x] The link includes appropriate accessible labels and icons (e.g., `Package` icon).
- [x] If clicked while unauthenticated, the user is redirected to `/login?callbackUrl=/account/orders`.

## Related Feature ID
FEAT-007 — Orders & Receipts

## Notes
Currently, `Saved Addresses` has top-level placement in the desktop header nav, whereas `Orders` (a much more frequent customer destination) is omitted entirely.
