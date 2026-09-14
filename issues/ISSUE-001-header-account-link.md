# ISSUE-001: Header Account CTA Unconditionally Directs to /login Regardless of Session State

## Summary
The desktop header "Account" button in the global storefront layout permanently hardcodes `href="/login"`. Authenticated customers who click "Account" are directed to the login page rather than their customer profile or an account dropdown menu.

## Location / Flow
Global Storefront Header → Navigation Actions (`src/app/(shop)/layout.tsx`, line 85).

## Steps to Reproduce
1. Sign in to an existing customer account via `/login`.
2. Observe successful authentication redirecting to `/account/profile` or homepage.
3. In the top storefront header, observe the "Account" button (`User` icon with "Account" label).
4. Click the "Account" button.
5. Notice the browser navigates directly to `/login`.

## Expected Behavior
Per `context/project-overview.md` and standard e-commerce UX:
- For unauthenticated users: the button directs to `/login`.
- For authenticated users: the button directs to `/account/profile` or toggles a user dropdown menu containing Profile, Orders, Wishlist, and Sign Out options.

## Actual Behavior
The link hardcodes `<Link href="/login">`, unconditionally navigating to `/login` even when a user session is active.

## Severity
Medium

## Scope
- **In Scope:** Updating `ShopLayout` header to be session-aware or providing an authenticated account button/dropdown linking to `/account/profile`.
- **Out of Scope:** Redesigning the entire authentication system or modifying customer profile views.

## Acceptance Criteria
- [x] When logged out, the header Account button links to `/login`.
- [x] When logged in, the header Account button links to `/account/profile` (or reveals an authenticated user menu).
- [x] The button maintains WCAG AA accessibility labels and keyboard focusability.

## Related Feature ID
FEAT-001 — Authentication & Profiles

## Notes
The mobile bottom navigation bar in the same layout correctly links to `/account/profile` (line 124), creating an inconsistent user experience between desktop and mobile.
