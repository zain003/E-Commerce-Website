# E-Commerce Project Invariants & Mandatory Rules

These rules are **ALWAYS ACTIVE** across the entire repository and must never be bypassed or violated under any circumstance.

---

## 0. MANDATORY PRE-ACTION CONTEXT GATE (Read Before Every Command & Edit)

**CRITICAL REQUIREMENT**: Before running any terminal command, writing code, creating components, modifying route handlers, or altering database schemas, the agent **MUST** read and verify the following 7 core context files and active contracts:

1. [`context/project-overview.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/project-overview.md) — Scope, goals, user flows, and phase boundaries.
2. [`context/architecture.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/architecture.md) — Stack matrix, boundaries, storage models, and architectural invariants.
3. [`context/code-standards.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/code-standards.md) — TypeScript strictness, async params, Zod validation, and `ApiResponse<T>` envelopes.
4. [`context/ui-context.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/ui-context.md) — Theme tokens, 8px grid, typography, and mobile-first layouts.
5. [`context/ai-workflow-rules.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/ai-workflow-rules.md) — Spec-driven implementation rules and Definition of Done.
6. [`context/testing-strategy.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/testing-strategy.md) — 4-layer SQA testing matrix (Fake DOM, API, Unit, DB) and test reports.
7. [`context/progress-tracker.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/progress-tracker.md) — Current phase, in-progress unit, and next milestone.

Additionally, for any feature implementation:
- Consult [`context/feature-specs/000-shared-contracts.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/000-shared-contracts.md) (single source of truth for Prisma schema & types).
- Consult [`context/feature-specs/INDEX.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/INDEX.md) and the exact feature specification file (`FEAT-XXX-*.md`).

---

## 1. Zero Silent Drift Rule
- Never silently guess ambiguous behavior or product requirements.
- If a requirement is ambiguous, make the smallest reasonable assumption and log it immediately in [`context/feature-specs/DEVIATIONS.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/DEVIATIONS.md) as:
  `[FILE-ID] — [what was ambiguous] — [assumption made]`
- If an ambiguity alters `000-shared-contracts.md`, **STOP** and request human confirmation.

---

## 2. Server-Side Price Invariant
- The client NEVER calculates final monetary values or provides trusted prices to payment routes.
- All totals, discounts, shipping fees, and PaymentIntent amounts must be computed directly from database records on the server.

---

## 3. Strict Next.js 16 & React 19 Patterns
- `params` and `searchParams` in page components and route handlers are Promises and **MUST** be awaited:
  `const { slug } = await params;`
- Default to React Server Components. Client Components (`"use client"`) are permitted only at the leaf level for user interactivity.
- Use Next.js 16 `"use cache"` and `cacheLife` for catalog reads, paired with `revalidateTag` on mutations.

---

## 4. 100% SQA Multi-Layer Quality Gate
- No feature is marked complete without passing all 4 testing layers (Frontend Fake DOM, API route contracts, backend business logic, DB integrity).
- Never disable, skip, or comment out failing tests.
- Every verified feature must have its test report committed to `feature-test-reports/FEAT-XXX-test-report.md`.
