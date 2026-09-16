# UI Context & Design System

## Theme & Visual Language
- **Aesthetic**: Modern Atelier / Quiet Luxury — refined, timeless, editorial, and tactile. The UI recedes gracefully so products feel like curated museum pieces, competing visually with the standards of Apple Store, SSENSE, Zara, Aesop, and Nike.
- **Brand Voice**: Customer-facing luxury signals replace developer- or framework-centric messaging (e.g. replacing "Next.js 16 • React 19 • Tailwind CSS v4" with "Artisanal Craftsmanship," "Carbon Neutral Delivery," and "Ethically Sourced Materials").
- **Design Philosophy**: Zero learning curve with generous whitespace, high visual contrast, soft diffused elevation, and exactly one unambiguous primary CTA per viewport (e.g. "Add to Bag" or "Proceed to Checkout").

---

## Color Tokens & Design System

All components utilize semantic CSS custom property tokens defined in Tailwind CSS v4:

| Role | CSS Variable | Tailwind Utility | Hex / HSL Value | Description |
|---|---|---|---|---|
| **Background Base** | `--background` | `bg-background` | `#fafaf9` (Stone 50) / `#fcfbfa` | Warm, tactile off-white base (not sterile pure white) |
| **Surface / Card** | `--card` | `bg-card` | `#ffffff` | Pure white floating surface creating depth via contrast rather than heavy borders |
| **Muted Surface** | `--muted` | `bg-muted` | `#f5f5f4` (Stone 100) | Soft warm stone for chips, badges, and skeleton loaders |
| **Primary Brand Text** | `--foreground` | `text-foreground` | `#121214` / `#1c1917` | Warm onyx/obsidian for high-contrast, editorial typography (not harsh `#000000`) |
| **Muted Text** | `--muted-foreground` | `text-muted-foreground` | `#78716c` (Stone 500) / `#71717a` | Warm pebble gray for subtitles, secondary labels, and meta info |
| **Border Default** | `--border` | `border-border` | `#e7e5e4` (Stone 200) | Ultra-subtle hairline divider for structured layouts |
| **Accent Option A (Bronze)** | `--accent` | `bg-accent text-accent-foreground` | `#b48a58` / `#926b3c` | Champagne bronze atelier for badges, star ratings, and luxury highlights |
| **Accent Option B (Cobalt)** | `--primary` | `bg-primary text-primary-foreground` | `#2563eb` | Deep monochrome base with vivid cobalt reserved exclusively for primary CTAs |
| **State: Error** | `--destructive` | `bg-destructive text-destructive-foreground` | `#ef4444` | Vivid crimson for validation errors and stock depletion alerts |
| **State: Success** | `--success` | `text-emerald-600 bg-emerald-50` | `#10b981` | Emerald green for confirmed payments, free shipping unlocked, and verified badges |

---

## Typography

| Role | Font Family | Tailwind Class | Specifications & Usage |
|---|---|---|---|
| **Primary UI Sans** | Plus Jakarta Sans / Outfit / Cabinet Grotesk | `font-sans` | Primary UI copy, navigation links, and standard buttons |
| **Editorial Serif Accent** | Playfair Display / Cormorant Garamond | `font-serif` | Hero headlines, collection titles, and italic accent words |
| **Hero Headlines** | `font-sans` or `font-serif` | `tracking-[-0.03em] font-bold` | Tight tracking, bold/confident weight for high-impact presence |
| **Eyebrows & Categories** | `font-sans` | `text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground` | High-fashion uppercase section tags and category indicators |
| **Prices** | `font-sans` | `tabular-nums font-semibold tracking-tight` | Monospaced numeric alignment preventing layout shifts on price changes |
| **Monospace / SKU** | JetBrains Mono / Geist Mono | `font-mono` | Order reference numbers, SKUs, and coupon promo codes |

---

## Border Radius & Elevation Scale

### Border Radius
| Context | Class | Pixel Size |
|---|---|---|
| **Pills & Tags** | `rounded-full` | Full radius (e.g. category chips, stock badges, quick-add variant pills) |
| **Small UI / Inputs** | `rounded-md` / `rounded-lg` | 6px – 8px (e.g. search pill, text inputs, select dropdowns) |
| **Cards & Panels** | `rounded-xl` | 12px (e.g. product cards, order summary boxes, review cards) |
| **Modals & Drawers** | `rounded-2xl` | 16px (e.g. cart drawer, spotlight search modal, checkout containers) |

### Shadows & Elevation
- **Card & Floating Panels**: Soft diffused shadows replacing harsh borders:
  ```css
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02);
  ```
- **Frosted Overlays**: `backdrop-blur-xl bg-background/80` for header and sticky bars; `backdrop-blur-md bg-white/85` for card badges.

---

## Component-Level Specifications

### 1. Header & Navigation
- **Frosted Glass Header**: Floating header with `backdrop-blur-xl bg-background/80 border-b border-border/40`, smoothly blurring background content as the page scrolls.
- **Announcement Strip**: Slim 36px top bar with rotating messages (free shipping thresholds, promo releases) with subtle animated indicator dots.
- **Spotlight Search**: Pill input with visible `⌘K` / `Ctrl+K` keyboard hint, opening an accessible spotlight overlay modal with live autocomplete and trending query suggestions.
- **Mega-Menu Navigation**: Hovering over "Catalog" or "Categories" reveals an editorial mega-menu featuring category thumbnails, featured collections, and "New Arrivals" spotlights.
- **Interactive Badges**: Cart and wishlist header icons feature animated item count pills with a micro-bounce animation (`scale-110`) on store updates.

### 2. Product Cards & Catalog Grid
- **Editorial Aspect Ratio**: Image container ratio standardizes to `aspect-[3/4]` or `aspect-[4/5]` (replacing `aspect-square`), aligning with luxury apparel and high-end goods.
- **Hover Image Cross-Fade**: Smooth 500ms ease-out cross-fade to secondary image (`product.images[1]`) on pointer hover.
- **Quick-Add Variant Slide-Up**: Hovering reveals an interactive bottom slide-up bar with variant pills (e.g. S, M, L, XL) allowing instant addition to bag without navigating away.
- **Frosted Floating Badges**: Top-left position with `backdrop-blur-md bg-white/85 text-foreground shadow-xs text-[10px] font-semibold tracking-wider uppercase` (e.g., "NEW ARRIVAL," "-25%," "BESTSELLER").
- **Glass Wishlist Toggle**: Circular glass button with spring-bounce animation on heart fill.
- **Image Motion**: Hairline/borderless card container with subtle image zoom on hover: `group-hover:scale-105 transition-transform duration-700 ease-out`.

### 3. Hero Section & Editorial Banners
- **Editorial Split-Grid / Banner**: Ambient high-resolution photography with subtle parallax depth.
- **Layered Headline Typography**: Large headlines combining heavy sans weights with italic serif accents for an editorial look.
- **Monochrome Trust Marquee**: Refined marquee featuring brand values ("Artisanal Craftsmanship," "Carbon Neutral Delivery," "Lifetime Warranty," "Ethically Sourced").
- **Spotlight Card**: Floating "Trending Now" card overlay linking directly to the store's #1 bestseller.

### 4. Product Detail Page (PDP)
- **Sticky Buy Box**: Pinned purchasing panel on desktop that stays in view as customer scrolls the gallery, story, and customer reviews.
- **Color Swatches & Fit Modal**: Rich circular swatches with active selection rings, paired with a "Size Guide & Fit Predictor" modal.
- **Stock Urgency Signal**: Dynamic low-stock indicator with soft pulse animation ("Only 3 left in stock").
- **Luxury Accordions**: Clean collapsible drawers for *Materials & Craftsmanship*, *Shipping & Returns*, and *Care & Longevity Guide*.
- **Social Proof**: Header integration with star rating, review count, and verified buyer counter.

### 5. Cart Drawer & Checkout Experience
- **Gamified Shipping Meter**: Dynamic progress bar towards free shipping ($100 threshold) with celebratory milestone visual state once unlocked.
- **"Complete the Look" Upsell**: Curated product recommendation carousel embedded at the base of the cart drawer.
- **Express Checkout Row**: Prominent Apple Pay and Google Pay styled buttons directly above standard multi-step checkout.
- **Trust Badges**: Payment trust row (Visa, Mastercard, Amex, Apple Pay, Stripe) accompanied by "Encrypted 256-bit SSL Checkout" reassurance.

---

## Layout Patterns

1. **Mobile Bottom Navigation**: Fixed bottom navigation bar on mobile viewports (< 768px) with thumb-accessible icons (Home, Search, Bag with animated badge, Wishlist, Account).
2. **Sticky Mobile Action Bar**: Fixed bottom bar on Product Detail Pages for mobile screens displaying current variant price and full-width "Add to Bag" button.
3. **Slide-Out Cart Drawer**: Animated right-side sheet (`Sheet` component) triggered by header bag icon or immediately upon adding an item.
4. **Multi-Step Checkout Flow**: 3-step linear wizard with progress stepper: 1. Address & Contact -> 2. Delivery Method -> 3. Payment.
5. **Back-Office Admin Layout**: Collapsible sidebar with navigation links (Dashboard, Products, Orders) and high-density data tables.

---

## Component Library
- **Foundation**: Built on top of **shadcn/ui** and **Radix UI** primitives styled with Tailwind CSS v4.
- **Location**: Base primitives reside in `src/components/ui/` (`button.tsx`, `input.tsx`, `card.tsx`, `sheet.tsx`, `dialog.tsx`, `badge.tsx`, `accordion.tsx`).
- **Composition Rule**: Adhere to composable component patterns without arbitrary utility bloat.

---

## Icons
- **Icon Library**: **Lucide React** (stroke-based vector icons).
- **Standard Sizing**:
  - `h-4 w-4` for inline badges, review stars, and dropdown chevrons.
  - `h-5 w-5` for interactive buttons and navigation bar items.
  - `h-8 w-8` for empty-state illustrations and hero value propositions.

---

## Execution Order (Phased Implementation)

1. **Phase 1: Design Tokens**: Warm stone/obsidian color palette, Plus Jakarta Sans/serif typography, diffused shadow scale, and global CSS custom properties in `globals.css`.
2. **Phase 2: Header & Hero**: Floating frosted header, 36px announcement strip, spotlight search pill, and editorial hero layout.
3. **Phase 3: Product Cards & Grid**: 3:4 aspect ratio, image cross-fade, frosted badges, and quick-add variant drawer.
4. **Phase 4: PDP Enhancements**: Sticky buy box, circular color swatches, stock pulse indicator, and luxury accordions.
5. **Phase 5: Cart Drawer & Checkout**: Free shipping meter, upsell carousel, express payment row, and trust verification indicators.

---

## Accessibility & Engineering Invariants
- **WCAG AA Compliance**: High-contrast ratios preserved across the warm stone background palette.
- **Motion Accessibility**: All hover zooms, badge bounces, and slide transitions must honor `prefers-reduced-motion`.
- **Zero Functional Regression**: Visual updates must preserve all existing functionality (cart persistence, server-side pricing, inventory validation, routing, and automated test coverage).
