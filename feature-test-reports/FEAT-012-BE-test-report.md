# SQA Test Report: FEAT-012-BE — Coupon Engine & Validation

## 1. Feature Metadata
- **Feature ID**: `FEAT-012-BE`
- **Feature Name**: Coupon Engine & Validation Service Backend
- **Target Layer**: Backend Service, Pure Discount Calculation Helpers, Zod Boundary Validation & Next.js 16 App Router Route Handlers
- **Date**: 2026-09-15
- **Author/Tester**: SQA Automation Engineer & Lead Full-Stack Agent
- **Target Specifications**: [`context/feature-specs/FEAT-012-BE-coupons.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-012-BE-coupons.md)

---

## 2. Test Environment & Stack
- **Framework**: Next.js 16.3.4 (App Router + Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Runtime**: Node.js v22
- **Testing Engine**: Vitest v5.0.0
- **DOM Simulator**: jsdom v29.1.1
- **Database / ORM**: PostgreSQL + Prisma Client v6.4.1 (`Coupon` model)

---

## 3. Traceability Matrix

| Acceptance Criterion | Automated Test Description | Test File Location | Status |
|---|---|---|---|
| **AC-1**: Valid percentage coupon correctly deducts percentage from subtotal | `calculates 10% discount on $100 subtotal accurately`<br>`calculates 25% discount on $80 subtotal accurately`<br>`rounds percentage discount amount to 2 decimal places`<br>`caps 100% discount at subtotal with newTotal 0` | [`tests/unit/coupon-discount-calc.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/coupon-discount-calc.test.ts) | **PASSED** |
| **AC-2**: Expired coupon returns HTTP 400 with code `COUPON_EXPIRED` | `returns HTTP 400 COUPON_EXPIRED when coupon expiration date has passed`<br>`accepts valid active coupon with future expiration date and trims whitespace` | [`tests/api/coupon-expiry.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-expiry.test.ts) | **PASSED** |
| **AC-3**: Cart subtotal below `minSpend` returns HTTP 400 with code `MINIMUM_SPEND_NOT_MET` | `returns HTTP 400 MINIMUM_SPEND_NOT_MET when cartSubtotal is less than minSpend`<br>`accepts coupon when cartSubtotal meets minSpend exactly or exceeds it` | [`tests/api/coupon-min-spend.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-min-spend.test.ts) | **PASSED** |
| **AC-4**: Usage limit exhausted returns HTTP 400 with code `COUPON_MAX_USES_REACHED` | `returns HTTP 400 COUPON_MAX_USES_REACHED when usedCount equals or exceeds maxUses` | [`tests/api/coupon-min-spend.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-min-spend.test.ts) | **PASSED** |
| **Edge Case 1**: Fixed amount discount clamped at subtotal | `deducts fixed $15.00 from $60.00 subtotal`<br>`clamps fixed discount at subtotal when discount exceeds subtotal (preventing negative totals)` | [`tests/unit/coupon-discount-calc.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/coupon-discount-calc.test.ts) | **PASSED** |
| **Edge Case 2**: Inactive and nonexistent codes | `returns HTTP 400 COUPON_INACTIVE when coupon isActive is false`<br>`returns HTTP 400 COUPON_NOT_FOUND when coupon code does not exist in database` | [`tests/api/coupon-expiry.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-expiry.test.ts) | **PASSED** |
| **Validation**: Payload validation | `returns HTTP 400 VALIDATION_ERROR when coupon code is empty or missing`<br>`returns HTTP 400 BAD_REQUEST when JSON payload is malformed` | [`tests/api/coupon-min-spend.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-min-spend.test.ts) | **PASSED** |

---

## 4. Test Suite Execution Results

```
Test Files: 3 passed (3 total for FEAT-012-BE)
     Tests: 17 passed (17 total for FEAT-012-BE)
```

### Layer-by-Layer Breakdown
- **Coupon Discount Calculations (Unit)**:
  - [`tests/unit/coupon-discount-calc.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/coupon-discount-calc.test.ts): **8 passed**, 0 failed
- **Coupon Expiry & Inactive Enforcement (API)**:
  - [`tests/api/coupon-expiry.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-expiry.test.ts): **4 passed**, 0 failed
- **Minimum Spend & Usage Limit Enforcement (API)**:
  - [`tests/api/coupon-min-spend.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/coupon-min-spend.test.ts): **5 passed**, 0 failed

---

## 5. SQA Verdict
**PASSED (100%)** — All 17 coupon backend test cases pass with zero failures. Strict TypeScript checks pass with zero errors (`npx tsc --noEmit` exited with 0). Ready for Frontend implementation (`FEAT-012-FE-coupons.md`).
