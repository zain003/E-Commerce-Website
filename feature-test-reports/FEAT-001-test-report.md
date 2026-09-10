# SQA Test Report: FEAT-001 — Auth & Account (BE + FE + VERIFY)

## 1. Feature Metadata
- **Feature ID**: `FEAT-001-BE`, `FEAT-001-FE`, `FEAT-001-VERIFY`
- **Feature Name**: Auth & User Accounts (Credentials Auth, Registration, Profile, Saved Addresses & Verification Pass)
- **Target Layer**: Full-Stack (Backend API Services + Frontend Fake DOM UI + Multi-Layer SQA Verification)
- **Execution Date**: 2026-09-11
- **Tester / Role**: Senior SQA Automation & Antigravity Agent
- **Status**: **PASSED (100%)**

---

## 2. Test Environment & Stack
- **Framework**: Next.js 16.3.4 (App Router + Turbopack), React 19.2.8
- **Styling**: Tailwind CSS v4 custom property tokens
- **Test Runner**: Vitest 5.0.0
- **DOM Simulator**: jsdom 29.1.1 + `@testing-library/react` + `@testing-library/user-event`
- **Database / ORM**: Prisma ORM 6.4.1 (PostgreSQL Schema)
- **Auth**: NextAuth / Auth.js Credentials Provider + bcryptjs
- **Forms**: React Hook Form 7.87 + `@hookform/resolvers/zod` + Zod 4.5.4

---

## 3. Traceability Matrix

### Backend Layer (`FEAT-001-BE`)
| Acceptance Criterion | Test Name | Test File | Verdict |
|---|---|---|---|
| Attempting to register an existing email returns HTTP `409` with code `"EMAIL_EXISTS"` | `returns 409 EMAIL_EXISTS when email is already registered` | `tests/api/auth-register.test.ts` | **PASS** |
| Passwords shorter than 8 characters fail Zod parsing with HTTP `400` | `rejects passwords shorter than 8 characters` / `returns 400 VALIDATION_ERROR when password is shorter than 8 characters` | `tests/unit/auth-validator.test.ts`, `tests/api/auth-register.test.ts` | **PASS** |
| Setting an address as `isDefault: true` automatically unsets previous default addresses for that user | `creates address and resets previous default if isDefault is true` | `tests/api/account-address.test.ts` | **PASS** |
| Unauthenticated requests to `/api/account/*` return HTTP `401` | `returns 401 UNAUTHORIZED when session is missing` (Profile, Address Post, Address Delete) | `tests/api/account-profile.test.ts`, `tests/api/account-address.test.ts` | **PASS** |
| Deleting an address belonging to another user returns HTTP `403 FORBIDDEN` | `returns 403 FORBIDDEN when attempting to delete another user's address` | `tests/api/account-address.test.ts` | **PASS** |
| Email trimming and lowercasing | `trims and lowercases email address` | `tests/unit/auth-validator.test.ts` | **PASS** |
| Address deletion by owner returns HTTP `200` with deleted ID | `successfully deletes own address and returns 200 with deletedId` | `tests/api/account-address.test.ts` | **PASS** |
| Address update returns HTTP `200` with updated data | `updates own address and returns 200` | `tests/api/account-address.test.ts` | **PASS** |

### Frontend UI Layer (`FEAT-001-FE`)
| Acceptance Criterion | Test Name | Test File | Verdict |
|---|---|---|---|
| All form inputs have associated accessible `<label>` and dynamic `aria-invalid` attributes | `renders all form elements with accessible labels and attributes` | `tests/ui/login-form.test.tsx`, `tests/ui/register-form.test.tsx` | **PASS** |
| Submitting invalid email shows inline validation error message without triggering API call | `shows inline validation error message on invalid email without triggering signIn` / `displays inline validation error on invalid email without calling register API` | `tests/ui/login-form.test.tsx`, `tests/ui/register-form.test.tsx` | **PASS** |
| Passwords < 8 chars show inline field error without triggering registration API | `displays field-level errors if password < 8 chars without calling register API` | `tests/ui/register-form.test.tsx` | **PASS** |
| Submitting valid credentials redirects user to previous page (`callbackUrl`) or `/account/profile` | `submits valid credentials and redirects to /account/profile by default` / `redirects to callbackUrl when specified in searchParams` | `tests/ui/login-form.test.tsx` | **PASS** |
| Invalid credentials display an accessible `role="alert"` notification | `displays accessible error alert when signIn fails` | `tests/ui/login-form.test.tsx` | **PASS** |
| Duplicate email during registration displays server error message in accessible alert | `displays accessible error alert when register API returns EMAIL_EXISTS` | `tests/ui/register-form.test.tsx` | **PASS** |
| Address list shows "Default" badge exclusively on the default address | `renders list of saved addresses and shows 'Default' badge exclusively on the default address` | `tests/ui/address-management.test.tsx` | **PASS** |
| Empty state rendered when user has no saved addresses | `displays empty state when no addresses exist` | `tests/ui/address-management.test.tsx` | **PASS** |
| Address creation modal opens, validates inputs, and appends to address list | `opens and closes the Add New Address modal` / `submits new address form and adds it to the list` | `tests/ui/address-management.test.tsx` | **PASS** |
| Deleting an address triggers API call and removes card from view | `triggers deletion and removes address from the list` | `tests/ui/address-management.test.tsx` | **PASS** |
| Pending submit states disable button with loading spinner | `disables submit button and shows spinner/pending state while submitting` | `tests/ui/login-form.test.tsx`, `tests/ui/register-form.test.tsx` | **PASS** |

---

## 4. Test Suite Execution Results

```
Test Files  7 passed (7)
     Tests  42 passed (42)
  Duration  4.21s
```

### Breakdown by SQA Layer
1. **Frontend / Fake DOM Tests**: 19 passed, 0 failed (`tests/ui/login-form.test.tsx`, `tests/ui/register-form.test.tsx`, `tests/ui/address-management.test.tsx`).
2. **API & Endpoint Tests**: 15 passed, 0 failed (`tests/api/auth-register.test.ts`, `tests/api/account-profile.test.ts`, `tests/api/account-address.test.ts`).
3. **Backend Logic & Validator Tests**: 8 passed, 0 failed (`tests/unit/auth-validator.test.ts`).
4. **Database & Storage Integrity Tests**: Atomic `$transaction` verified for default address toggles.

---

## 5. Edge Cases & Accessibility Checks Verified
- **ARIA & Accessibility**: Every input linked to corresponding `<label>` via `id`/`htmlFor`, dynamic `aria-invalid` (`true`/`false`), inline errors with `role="alert"`, and modal dialogs with `role="dialog"` + `aria-modal="true"`.
- **Pending/Busy State**: Buttons disable and display spinners while submission promises resolve, preventing double-submission.
- **Client Validation Guard**: Invalid emails and short passwords reject before any network dispatch occurs.
- **Empty States**: Clear CTA and visual guidance when an account has zero saved addresses.
- **Next.js 16 Compatibility**: App Router route parameters and searchParams properly awaited or wrapped in React `Suspense`.

---

## 6. Defects Found & Resolved
- **Defect 1**: In `register-form.tsx`, optional `name` field initialized with `""` triggered `.min(1, "Name cannot be empty")` in `registerSchema` when left blank.
  - *Fix*: Transformed empty string `""` to `undefined` in client form resolver, preserving optionality while strictly rejecting whitespace-only inputs.
- **Defect 2**: In `address-form-modal.tsx`, `useForm<AddressInput>` suffered a TypeScript discrepancy due to Zod's `input` (`isDefault?: boolean`) vs `output` (`isDefault: boolean`).
  - *Fix*: Configured `useForm<z.input<typeof addressSchema>, unknown, AddressInput>` allowing seamless input-to-output resolution with zero type errors.

---

## 7. Final SQA Verdict
**PASSED (100%)** — All 42 automated tests passing, zero TypeScript errors (`tsc --noEmit`), production build (`next build`) succeeded with zero errors.
