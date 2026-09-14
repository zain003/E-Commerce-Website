# Quality Check — E-Commerce Web App QA Audit Prompt

**Role:** You are a senior QA engineer performing a full functional and navigational audit of this e-commerce web application (Next.js 16 / React 19 / Tailwind v4 / Prisma / Stripe). Use `project-overview.md` as the source of truth for intended flows, features, and scope.

**Objective:** Systematically trace every clickable element, route, and user flow across the customer and admin experiences, verify each destination/behavior against the documented spec, and log every defect or gap as a discrete issue file.

---

## Audit Scope

### 1. Global Navigation & Layout
- Every navbar/footer link (Home, Categories, Search, Cart, My Account, Wishlist, Admin link, etc.) — confirm correct destination and behavior for both logged-out and logged-in states.
- Bottom tab bar (mobile) and slide-out cart drawer — confirm all triggers, close/open states, and thumb-reachability.

### 2. Authentication & Profiles
- Sign up, sign in, sign out, session persistence, guest-cookie cart handoff on login.
- Profile CRUD, address CRUD, password/account edge cases (invalid input, duplicate email, expired session).
- Role verification: does an `ADMIN` account correctly gate admin routes, and does a non-admin get blocked/redirected?

### 3. Customer Flow
- Discovery → search/filter (debounce, price range, sort, URL state sync) → Product Detail Page (variant selection, price delta, stock status) → Cart (add/update/remove, stock-limit validation, discount code) → 3-step Checkout (Address → Delivery → Stripe Payment) → Confirmation/Receipt → `/account/orders` tracking.
- Trace every button/CTA in this path and confirm it leads where expected.

### 4. Admin Flow
- Admin login/role gate → Catalog & Inventory management (product/variant CRUD, `revalidateTag` cache behavior) → Order Fulfillment (status transitions: PROCESSING → SHIPPED → DELIVERED) → KPI Dashboard (revenue, order volume, pending fulfillment accuracy).

### 5. Phase 2 Features (if implemented)
- Reviews & ratings, wishlist (heart toggle, move-to-cart), coupons/discounts.

### 6. Cross-Cutting Checks
- Broken links / dead-end buttons / 404s.
- Error states (payment failure, out-of-stock at checkout, invalid coupon).
- WCAG AA contrast and accessibility on interactive elements.
- Consistency between documented scope (Phase 1/2/3) and what's actually reachable in the UI — flag anything out-of-scope that's exposed, or in-scope that's missing.

---

## Deliverable

For every issue found, create a separate Markdown file in a root-level `/issues` folder, named `ISSUE-XXX-short-slug.md`, using this template:

```markdown
# ISSUE-XXX: <Short descriptive title>

## Summary
One or two sentences describing the defect or gap.

## Location / Flow
Where in the app this occurs (e.g., "Navbar → My Account → Orders tab").

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What the spec (project-overview.md) or standard UX practice says should happen.

## Actual Behavior
What actually happens.

## Severity
Critical / High / Medium / Low

## Scope
- **In Scope:** What this issue covers.
- **Out of Scope:** What is deliberately excluded from this specific fix.

## Acceptance Criteria
- [ ] Condition 1
- [ ] Condition 2
- [ ] Condition 3

## Related Feature ID
(e.g., FEAT-004 — Cart & Persistence)

## Notes
Any additional context, screenshots, or edge cases worth flagging.
```

---

## Process Instructions
- Work systematically through each flow above rather than randomly; don't skip a section even if it seems low-risk.
- If a flow cannot be tested because a feature isn't implemented yet, log it as an issue with severity noted and reference the relevant `FEAT-XXX` ID from the spec, rather than skipping silently.
- Do not fix issues — only identify, document, and file them.
- After completing the audit, produce a summary `ISSUES-INDEX.md` in the `/issues` folder listing all issues with ID, title, and severity for quick scanning.
