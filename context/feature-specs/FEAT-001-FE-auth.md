# FEAT-001-FE — Auth & Account UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Forms

## Goal
Build accessible, mobile-first login, registration, and user profile management forms using React Hook Form, Zod, and Tailwind CSS.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-001-BE-auth.md`
- **Context pack**:
```typescript
import { RegisterDto, AddressDto } from "./FEAT-001-BE-auth";
import { User, Address, ApiResponse } from "@/types";
```
- **Consumes**:
  - `POST /api/auth/register` -> `registerUser(dto: RegisterDto)`
  - `GET /api/account/profile` -> `getCurrentUser()`
  - `POST /api/account/addresses` -> `createOrUpdateAddress(dto: AddressDto)`
  - `DELETE /api/account/addresses/:id` -> `deleteAddress(id: string)`

## Scope (In)
- `/login` page with email/password inputs, error alerts, and redirect handling.
- `/register` page with validation feedback.
- `/account/profile` page displaying user information.
- `/account/addresses` page with list of saved addresses, "Add New Address" modal/form, and delete triggers.

## Scope (Out)
- Backend auth logic / password hashing (handled in `FEAT-001-BE-auth.md`).
- Password reset flow (Phase 2).

## Tech / Files to Touch
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/account/profile/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/account/address-card.tsx`

## Tests to Write FIRST
1. `tests/ui/login-form.test.tsx`: Renders validation error on empty submit; triggers signIn on valid submit.
2. `tests/ui/register-form.test.tsx`: Displays field-level errors if password < 8 chars.
3. `tests/ui/address-management.test.tsx`: Displays saved addresses list; toggles address modal.

## Implementation Steps
1. Create `LoginForm` with `react-hook-form` + `zodResolver` in `src/components/auth/login-form.tsx`.
2. Create `RegisterForm` with immediate feedback in `src/components/auth/register-form.tsx`.
3. Build `/login` and `/register` route pages in `src/app/(auth)/`.
4. Build `/account/profile` showing user email, name, and registered date.
5. Build `/account/addresses` with `AddressCard` and modal dialog for adding/editing addresses.

## Acceptance Criteria
- [ ] Submitting invalid email shows inline validation error message without triggering API call.
- [ ] Submitting valid credentials redirects user to previous page or `/account/profile`.
- [ ] Address list shows "Default" badge exclusively on the default address.
- [ ] All inputs have associated accessible `<label>` and `aria-invalid` attributes.

## Definition of Done
- [ ] React Testing Library fake DOM tests pass 100%.
- [ ] Zero ESLint and TypeScript errors.
- [ ] Responsive UI verified on mobile (375px) and desktop (1280px).

## Edge Cases to Handle
- Network failure shows toast alert rather than crashing component.
- Disabled submit buttons with spinner during pending form submissions.

## Pre-flight Check
- Before starting, confirm `FEAT-001-BE-auth.md` passes API tests.

## What's Next
- `FEAT-001-VERIFY-auth.md` (Authentication Full-Stack Verification).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-001-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
