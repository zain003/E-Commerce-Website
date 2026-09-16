# Master Prompt: World-Class E-Commerce UI Transformation

Use this as a single prompt to drive the redesign (feed it to Claude Code / an AI coding agent, or work through it phase by phase). It encodes the full creative direction, tokens, and component-level specs from the design audit.

---

## Role & Objective

You are a senior product designer and frontend engineer. Transform this e-commerce storefront from its current generic tech-SaaS aesthetic into a **world-class, high-end retail destination** — competing visually with Apple Store, SSENSE, Zara, Aesop, and Nike. Preserve all existing functionality (cart, product data, routing, state) while fully re-skinning the visual and interaction layer.

Work incrementally, phase by phase, and don't break existing behavior. After each phase, the app should still build and run.

---

## Brand Direction

**Aesthetic**: Modern Atelier / Quiet Luxury — refined, timeless, editorial, tactile. The UI should recede so products look like museum pieces.

**Voice**: Replace developer/framework-facing copy (e.g. "Next.js 16 • React 19 • Tailwind CSS v4") with customer-facing luxury signals (e.g. "Artisanal Craftsmanship," "Carbon Neutral Delivery," "Ethically Sourced Materials").

---

## Design Tokens (apply first, storewide)

**Typography**
- Primary sans: Plus Jakarta Sans, Outfit, or Cabinet Grotesk (replace Geist Sans/Mono)
- Optional editorial serif accent for hero/collection headlines: Playfair Display or Cormorant Garamond
- Hero headlines: tight tracking (`tracking-[-0.03em]`), bold/confident weight
- Eyebrows/category labels: `text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground`
- Prices: tabular numerals, `tabular-nums font-semibold tracking-tight`

**Color**
- Background base: warm off-white — `#fafaf9` (Stone 50) or `#fcfbfa`, not pure white
- Card/panel surfaces: pure `#ffffff` floating on the warm background (depth via contrast, not borders)
- Foreground/headings: warm onyx `#121214` / `#1c1917`, not pure black
- Muted text: warm pebble gray `#78716c` / `#71717a`
- Accent — choose one:
  - **Bronze Atelier**: champagne bronze `#b48a58` / `#926b3c` for badges, stars, hover states
  - **Monochrome + Cobalt**: deep monochrome with `#2563eb` reserved only for primary CTAs
- Shadows: soft diffused, not hard borders — `box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.02)`

Update these as CSS variables / Tailwind theme tokens in `globals.css` and the design-token layer so every component inherits them automatically.

---

## Component-Level Specs

### 1. Header & Navigation
- Floating frosted glass header: `backdrop-blur-xl bg-background/80 border-b border-border/40`, blurring content on scroll
- Slim (36px) top announcement strip with rotating messages (e.g. free shipping threshold, promo code), subtle animated indicator
- Search: elegant pill input with `⌘K` / `Ctrl+K` hint, opening a spotlight modal with live autocomplete and trending queries
- "Catalog"/"Categories" hover reveals a mega-menu: category thumbnails, featured collections, "New Arrivals" spotlight
- Cart/wishlist icons get animated count pills with a micro-bounce (`scale-110`) on update

### 2. Product Cards & Catalog Grid
- Switch image aspect ratio from `aspect-square` to `aspect-[3/4]` or `aspect-[4/5]` (industry standard for apparel/luxury goods)
- On hover: cross-fade to `product.images[1]` (500ms ease-out)
- Hover quick-add bar sliding up from bottom with variant pills (S/M/L/XL), no navigation required
- Floating frosted badges top-left: "NEW ARRIVAL," "-25%," "BESTSELLER" — `backdrop-blur-md bg-white/85 text-foreground shadow-xs`
- Circular glass wishlist button with spring-bounce heart fill
- Hairline/borderless cards, image zoom on hover: `group-hover:scale-105 transition-transform duration-700 ease-out`

### 3. Hero Section
- Editorial split-grid or ambient visual banner with high-res photography, subtle parallax
- Layered typography — large headline mixing weights, optional italic serif accent word
- Elegant monochrome trust/press marquee ("FEATURED IN..." or value pillars: carbon neutral, lifetime guarantee, free returns)
- Floating "Trending Now" spotlight card linking to the #1 bestseller

### 4. Product Detail Page (PDP)
- Sticky buy box pinned on the right as the user scrolls the gallery/description/reviews
- Rich circular color swatches with active-state rings; "Size Guide & Fit Predictor" modal
- Low-stock urgency signal with pulse animation ("Only 3 left in stock")
- Collapsible accordions: Materials & Craftsmanship / Shipping & Returns / Care & Longevity Guide
- Social proof under the title: filled star rating + verified review count

### 5. Cart Drawer & Checkout
- Gamified free-shipping progress meter with a celebration state once unlocked
- "Complete the Look" upsell carousel at the drawer's base
- Express checkout row (Apple Pay / Google Pay styled buttons) above standard checkout
- Payment trust row (Visa/Mastercard/Amex/Apple Pay/Stripe icons) + "Encrypted 256-bit SSL Checkout" note

---

## Execution Order (recommended phases)

1. **Design tokens** — typography, warm stone/obsidian color system, shadow scale. Everything else inherits from this.
2. **Header & hero** — highest first-impression impact.
3. **Product cards** — 3:4 ratio, hover reveal, quick-add overlay. Highest conversion impact.
4. **PDP enhancements** — sticky buy box, accordions, social proof.
5. **Cart drawer & checkout polish** — shipping meter, upsell, trust signals.

## Constraints

- Follow the project's existing code standards, architecture conventions, and AI workflow rules already documented in the repo.
- Don't introduce new dependencies without checking if an existing primitive (e.g. shadcn/ui component) already covers the need.
- Keep all changes accessible: sufficient contrast on the new warm palette, focus states preserved, animations respect `prefers-reduced-motion`.
- Test each phase against the project's existing testing strategy before moving to the next.