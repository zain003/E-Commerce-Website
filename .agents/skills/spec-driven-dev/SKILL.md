---
name: spec-driven-dev
description: >-
  Executes the spec-driven development workflow for this e-commerce project.
  Use when implementing any feature from context/feature-specs/ (BE, FE, INT, VERIFY),
  updating progress-tracker.md, tracking status in INDEX.md, or logging ambiguities in DEVIATIONS.md.
---

# Spec-Driven Development Workflow

This skill provides step-by-step instructions for executing the spec-driven implementation process defined in `context/feature-specs/plan.md`.

## Core Lifecycle

```
[BE Spec] ──> [BE SQA Tests & Code] ──> [FE Spec] ──> [FE Tests & Code] ──> [VERIFY Spec] ──> [Test Report] ──> [INDEX.md]
```

## Step 1: Pre-Flight Check & Context Loading
1. Locate the feature file in `context/feature-specs/` (e.g., `FEAT-001-BE-auth.md`).
2. Read `000-shared-contracts.md` and the current spec's **Depends on** and **Context pack** sections.
3. Confirm that all prerequisite features have a passing `VERIFY` test report in `feature-test-reports/`.

## Step 2: Test-First SQA Implementation
1. Review the **Tests to write FIRST** section in the spec.
2. Implement automated tests (Vitest / RTL Fake DOM / API Route Handlers / DB Transactions) matching every Acceptance Criterion.
3. Run the test suite:
   ```bash
   npm test
   ```
4. Confirm test failure on unimplemented features (red phase).

## Step 3: Implement Code Within Defined Scope
1. Follow the numbered **Implementation steps** in the spec.
2. Touch only the files listed under **Tech / files to touch**.
3. Do not add out-of-scope behaviors or speculative logic.

## Step 4: Ambiguity Resolution
If any requirement is unclear:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md`:
   `[FILE-ID] — [what was ambiguous] — [assumption made]`
4. If it affects the data model in `000-shared-contracts.md`, stop and request human confirmation.

## Step 5: SQA Verification & Reporting
1. Run all multi-layer tests across Frontend Fake DOM, API routes, and backend unit tests.
2. Run `npm run build` and TypeScript check (`npx tsc --noEmit`) to confirm zero errors.
3. Create the test report in `feature-test-reports/FEAT-XXX-test-report.md`.
4. Update `context/feature-specs/INDEX.md` and `context/progress-tracker.md`.
