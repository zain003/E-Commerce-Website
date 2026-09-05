# UI Context

## Theme & Visual Language
- **Aesthetic**: Mobile-first, clean, modern, and universal e-commerce aesthetic. Generous whitespace, crisp typography, subtle elevation borders, and high visual contrast.
- **Design Philosophy**: Zero learning curve. Clear visual hierarchy with exactly one primary CTA per view (e.g. bold "Add to Cart" or "Proceed to Checkout").

---

## Color Tokens & Design System

All components utilize semantic CSS custom property tokens defined in Tailwind CSS v4:

| Role | CSS Variable | Tailwind Utility | Description / Value |
|---|---|---|---|
| **Background Base** | `--background` | `bg-background` | Clean white (`#ffffff`) for primary page background |
| **Surface / Card** | `--card` | `bg-card` | Pure white (`#ffffff`) or subtle layered off-white |
| **Muted Surface** | `--muted` | `bg-muted` | Soft cool gray (`#f4f4f5`) for chips, badges, and skeletons |
| **Primary Brand Text** | `--foreground` | `text-foreground` | Deep slate/near-black (`#09090b`) for high readability |
| **Muted Text** | `--muted-foreground` | `text-muted-foreground` | Slate gray (`#71717a`) for secondary labels and subtitles |
| **Primary Accent / CTA**| `--primary` | `bg-primary text-primary-foreground` | Confident indigo/slate (`#18181b` or `#2563eb`) for main buttons |
| **Border Default** | `--border` | `border-border` | Subtle hairline gray (`#e4e4e7`) for card borders and dividers |
| **State: Error** | `--destructive` | `bg-destructive text-destructive-foreground` | Vivid crimson (`#ef4444`) for errors and stock alerts |
| **State: Success** | `--success` | `text-emerald-600 bg-emerald-50` | Emerald green (`#10b981`) for confirmed payments and badges |

---

## Typography

| Role | Font Family | Tailwind Class | Usage |
|---|---|---|---|
| **UI & Headings** | Inter / Geist Sans | `font-sans` | All standard UI copy, product titles, and buttons |
| **Monospace / SKU**| Geist Mono | `font-mono` | Order numbers, SKUs, and coupon promo codes |

---

## Border Radius Scale

| Context | Class | Pixel Size |
|---|---|---|
| **Pills & Tags** | `rounded-full` | Full radius (e.g. category chips, stock badges) |
| **Small UI / Inputs** | `rounded-md` | 6px (e.g. text inputs, select dropdowns) |
| **Cards & Panels** | `rounded-xl` | 12px (e.g. product cards, order summary boxes) |
| **Modals & Drawers** | `rounded-2xl` | 16px (e.g. cart drawer, checkout step containers) |

---

## Component Library
- **Foundation**: Built on top of **shadcn/ui** and **Radix UI** primitives using Tailwind CSS v4.
- **Location**: Base primitives reside in `src/components/ui/` (`button.tsx`, `input.tsx`, `card.tsx`, `sheet.tsx`, `dialog.tsx`, `badge.tsx`).

---

## Layout Patterns

1. **Mobile Bottom Navigation**: Fixed bottom navigation bar on mobile viewports (< 768px) with thumb-accessible icons (Home, Search, Cart with badge, Account).
2. **Sticky Mobile Action Bar**: Fixed bottom bar on Product Detail Pages on mobile containing live price and full-width "Add to Cart" button.
3. **Slide-Out Cart Drawer**: Animated right-side sheet (`Sheet` component) triggered by header cart icon or after adding an item.
4. **Multi-Step Checkout Flow**: 3-step linear wizard with clear progress indicator (1. Address -> 2. Delivery -> 3. Payment).
5. **Back-Office Admin Layout**: Collapsible sidebar with navigation links (Dashboard, Products, Orders) and main content data table.

---

## Icons
- **Icon Library**: **Lucide React** (stroke-based vector icons).
- **Standard Sizing**:
  - `h-4 w-4` for inline badges and dropdown chevrons.
  - `h-5 w-5` for buttons and navigation bar items.
  - `h-8 w-8` for empty-state illustrations and hero icons.
