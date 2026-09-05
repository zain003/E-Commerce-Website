<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# E-Commerce Project Agent Rules & Invariants

All agents working on this project MUST follow the specifications, standards, and guidelines established in the core context documents:

## 0. MANDATORY PRE-ACTION CONTEXT GATE (Read Before Every Command & Edit)
Before executing any command, writing code, or creating files, the agent **MUST** read and verify the 7 core context files:
1. [`context/project-overview.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/project-overview.md): Project vision, speed & mobile-first goals, customer/admin user flows, and phase scopes.
2. [`context/architecture.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/architecture.md): Stack matrix (Next.js 16, React 19.2, Tailwind v4, Prisma, Stripe), folder boundaries, and architectural invariants.
3. [`context/code-standards.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/code-standards.md): Strict TypeScript rules, async `params`/`searchParams`, Zod boundary validation, and `ApiResponse<T>` envelopes.
4. [`context/ui-context.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/ui-context.md): Clean universal UI theme, Tailwind CSS v4 custom property tokens, 8px spacing grid, and mobile navigation layouts.
5. [`context/ai-workflow-rules.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/ai-workflow-rules.md): Spec-driven workflow (`BE` -> `FE` -> `VERIFY`), Ambiguity Resolution Protocol, and DoD requirements.
6. [`context/testing-strategy.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/testing-strategy.md): 4-layer SQA testing matrix (Fake DOM, API routes, Unit, DB constraints) and test report generation.
7. [`context/progress-tracker.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/progress-tracker.md): Active milestone tracker for completed and in-progress units.

Also consult:
- [`context/feature-specs/000-shared-contracts.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/000-shared-contracts.md): Single source of truth for Prisma models & global contracts.
- [`context/feature-specs/INDEX.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/INDEX.md) and current target spec (`FEAT-XXX-*.md`).

## 1. Core Operational Invariants
1. **Zero Silent Drift**: Never silently guess ambiguous behavior. Log every assumption in [`context/feature-specs/DEVIATIONS.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/DEVIATIONS.md).
2. **Server-Side Price Invariant**: Payment amounts and line-item totals are strictly computed on the server from verified database prices.
3. **Strict Next.js 16 Patterns**: Mandatory `await` for `params`/`searchParams`, Server Components by default, `"use cache"` for catalog reads.
4. **100% SQA Quality Gate**: Every feature must pass all automated test suites across all 4 testing layers before being marked complete.


