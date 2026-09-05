# AI Workflow Rules

## Approach
Build this project incrementally using a strict, spec-driven workflow. The specification files in `context/feature-specs/` and context documents in `context/` define what to build, how to build it, and how to verify it. Always implement against these specifications — do not infer or invent behavior from scratch.

---

## Scoping Rules
- Work on exactly one feature specification unit at a time (e.g. `FEAT-001-BE-auth.md`, then `FEAT-001-FE-auth.md`, then `FEAT-001-VERIFY-auth.md`).
- Implement the Backend service and endpoints (`BE`) before creating the Frontend UI (`FE`).
- Prefer small, verifiable increments over speculative cross-cutting modifications.
- Do not combine unrelated system boundaries in a single implementation step.

---

## When to Split Work
Split an implementation step immediately if it combines:
- Database schema changes and extensive client UI animations in the same turn.
- Multiple unrelated API route handlers across different domains.
- Complex third-party payment integration with customer account views.

If a change cannot be tested and verified end-to-end quickly, the scope is too broad — split it according to `context/feature-specs/plan.md`.

---

## Handling Missing Requirements & Ambiguities
1. Do not invent product behavior that contradicts or is not covered in `context/` or `context/feature-specs/`.
2. Follow the **Ambiguity Resolution Protocol**:
   - Make the smallest reasonable assumption needed to proceed.
   - Log it in `context/feature-specs/DEVIATIONS.md` as: `[FILE-ID] — [what was ambiguous] — [assumption made]`.
   - If the ambiguity affects the core data model in `000-shared-contracts.md`, **STOP** and request human clarification.

---

## Protected Files
Do not modify the following unless explicitly instructed:
- `src/components/ui/*` — Generated shadcn/ui library primitives. Use shadcn CLI or custom wrapper components instead of altering core primitives.
- `context/feature-specs/000-shared-contracts.md` — Core data model single source of truth (must not be altered silently without flagging in `DEVIATIONS.md`).

---

## Keeping Documentation in Sync
Update the relevant context files whenever implementation progresses:
- `context/feature-specs/INDEX.md` — Mark status and link completed SQA test reports.
- `context/feature-specs/DEVIATIONS.md` — Log every assumption made.
- `context/progress-tracker.md` — Update current phase, completed units, and next up milestone.

---

## Quality Gate (Before Moving to Next Unit)
1. The current feature unit works end-to-end within its defined scope.
2. No architectural invariant in `context/architecture.md` was violated.
3. Multi-layer tests (Fake DOM, API routes, Backend logic, Database constraints) pass 100% per `context/testing-strategy.md`.
4. Dedicated test report is written to `feature-test-reports/FEAT-XXX-test-report.md`.
5. `npm run build` and TypeScript check pass with zero errors.
