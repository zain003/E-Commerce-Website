# FEAT-001-VERIFY — Auth Verification Pass
**Files being verified**: `FEAT-001-BE-auth.md`, `FEAT-001-FE-auth.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/login-form.test.tsx tests/ui/register-form.test.tsx tests/ui/address-management.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/auth-register.test.ts tests/api/account-address.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/auth-validator.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Attempting to register an existing email returns HTTP `409` with error code `"EMAIL_EXISTS"`.
- [ ] Passwords shorter than 8 characters fail Zod parsing with HTTP `400`.
- [ ] Setting an address as `isDefault: true` automatically unsets previous default addresses for that user.
- [ ] Unauthenticated requests to `/api/account/*` return HTTP `401`.
- [ ] Submitting invalid email shows inline validation error message without triggering API call.
- [ ] Submitting valid credentials redirects user to previous page or `/account/profile`.
- [ ] Address list shows "Default" badge exclusively on the default address.
- [ ] All inputs have associated accessible `<label>` and `aria-invalid` attributes.

## 3. SQA Definition of Done Checklist
- [ ] All multi-layer tests (Frontend DOM, API, Backend) pass with 0 failures and 0 skipped.
- [ ] `npm run build` and TypeScript checks pass with 0 errors.
- [ ] No hardcoded strings or missing aria attributes in auth forms.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-001-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-001.

## 4. Failure Protocol
If anything fails: do NOT mark complete. Diagnose and fix root causes immediately, re-run tests until 100% passing, then update `INDEX.md`.
