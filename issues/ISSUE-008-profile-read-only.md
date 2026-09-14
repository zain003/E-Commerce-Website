# ISSUE-008: Customer Profile Is Read-Only with No Edit Form or Update API

## Summary
The customer profile page (`/account/profile`) is entirely read-only. Customers cannot update their display name, contact information, or change their password. Furthermore, the backend route `/api/account/profile` only supports `GET` with no `PATCH` or `PUT` endpoint implemented.

## Location / Flow
Account Portal → Profile View (`src/components/account/profile-view.tsx`) & API (`src/app/api/account/profile/route.ts`).

## Steps to Reproduce
1. Sign in to a customer account and navigate to `/account/profile`.
2. Inspect the Profile Card on the left: observe user name, email, role badge, and joined date.
3. Attempt to find an "Edit Profile", "Change Name", or "Change Password" button or input.
4. Notice there are no interactive form controls or modals to update profile data.
5. Inspect `src/app/api/account/profile/route.ts`; notice only `GET` is exported.

## Expected Behavior
Per `context/project-overview.md` (Phase 1 — MVP: "Authentication & Profiles (`FEAT-001`): Credentials auth, registration, profile & address CRUD") and standard account management capabilities, customers should be able to update their profile information (e.g. update their full name or password).

## Actual Behavior
Profile management is strictly Read-Only. Only Address CRUD is functional; Profile CRUD only provides Read and Delete (via cascade/admin).

## Severity
Medium

## Scope
- **In Scope:** Adding `PATCH /api/account/profile` route handler with Zod validation and adding an "Edit Profile" modal/form in `ProfileView` to update user name.
- **Out of Scope:** Implementing complex OAuth multi-factor or email-verification flows.

## Acceptance Criteria
- [ ] `PATCH /api/account/profile` accepts and validates profile updates (e.g., `name`).
- [ ] `ProfileView` renders an "Edit Profile" button opening an accessible modal or inline edit form.
- [ ] Submitting the form updates the user name in the database and updates the UI immediately.
- [ ] Unauthenticated requests to mutate profile return HTTP 401.

## Related Feature ID
FEAT-001 — Authentication & Profiles

## Notes
While Address CRUD was fully implemented with `AddressFormModal` and `AddressesView`, Profile editing was omitted during `FEAT-001`.
