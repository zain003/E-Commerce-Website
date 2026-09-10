# Deviations & Assumptions Log

This file is a running log of ambiguities encountered and assumptions made during implementation sessions.

### Protocol
1. Do NOT silently guess when specifications are ambiguous.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it here using the format below:
   `[FILE-ID] — [what was ambiguous] — [assumption made]`
4. If an ambiguity affects the core data model in `000-shared-contracts.md`, **STOP** and flag for human review immediately.

---

## Log Entries

- `[FEAT-002-FE]` — Route collision between root `src/app/page.tsx` and `src/app/(shop)/page.tsx` — Migrated root `page.tsx` into `src/app/(shop)/page.tsx` with shared `(shop)/layout.tsx` per `architecture.md` to cleanly support customer storefront route grouping and mobile navigation bars.

