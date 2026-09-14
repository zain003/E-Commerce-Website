# ISSUE-007: Guest Cookie Cart Items Are Not Merged into User Account on Login

## Summary
The backend route `POST /api/cart/merge` and service `mergeGuestCart` were implemented to migrate guest cart items to the customer's account upon authentication, but the frontend authentication flow (`LoginForm` or auth listener) never invokes this endpoint. Consequently, items added to a cart by an unauthenticated guest are orphaned and not merged when the user signs in.

## Location / Flow
Authentication Flow → Sign In (`src/components/auth/login-form.tsx`, lines 35-58) & Cart Service (`src/lib/services/cart.ts`).

## Steps to Reproduce
1. In an incognito window (unauthenticated), browse to a product page and click "Add to Cart".
2. Open the cart drawer; verify the item appears in the guest cart (backed by `guest_cart_token` cookie).
3. Click "Account" or go to `/login`.
4. Fill in valid customer credentials and click "Sign in".
5. Observe the sign-in succeeds and redirects to `/account/profile`.
6. Open the cart drawer or navigate to `/cart`.
7. Notice the guest items were not merged into the authenticated user's cart in the database.

## Expected Behavior
Per `context/project-overview.md` (Core User Flows 3: "Customer adds items to cart (authenticated or guest via HTTP-only cookie)") and `context/feature-specs/FEAT-004-BE-cart.md` (Guest Cart & Cookie Handoff: "Merging: When guest logs in, merge guest cart into user cart via `POST /api/cart/merge`"):
Upon successful credentials authentication, the application must automatically invoke `POST /api/cart/merge` (or synchronize through `useCartStore.fetchCart()`) so that guest cart items transition seamlessly into the authenticated user's cart.

## Actual Behavior
`LoginForm.onSubmit` simply calls NextAuth `signIn("credentials", ...)` and navigates to `callbackUrl`. No call to `/api/cart/merge` or store cart synchronization is performed anywhere on the client. The endpoint `POST /api/cart/merge` is dead code from the UI's perspective.

## Severity
High

## Scope
- **In Scope:** Triggering `POST /api/cart/merge` upon successful authentication in `LoginForm` (or via a global session synchronization effect) and updating `useCartStore`.
- **Out of Scope:** Modifying `mergeGuestCart` backend database logic, which is already functional.

## Acceptance Criteria
- [ ] When a guest with items in their cart signs in, `POST /api/cart/merge` is called.
- [ ] All items from the guest cart are merged into the customer's account cart.
- [ ] The `useCartStore` is refreshed immediately with the merged items.
- [ ] Cart drawer displays the updated merged items and subtotal.

## Related Feature ID
FEAT-001 — Authentication & Profiles, FEAT-004 — Cart & Persistence

## Notes
A broken cart handoff is a leading cause of abandoned carts in e-commerce, as customers who sign in at checkout expect their items to follow them.
