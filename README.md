# E-Commerce-Website

A fast, mobile-first, production-ready online store built with **Next.js 16 (App Router)**, **React 19.2**, **Tailwind CSS v4**, **Prisma ORM**, and **Stripe**.

---

## Tech Stack
- **Framework**: Next.js 16 (Turbopack, React Server Components, Cache Components `"use cache"`)
- **UI & Styling**: React 19.2, Tailwind CSS v4, Lucide React
- **State Management**: Zustand (Client/Cart), TanStack React Query (Server State)
- **Forms & Validation**: React Hook Form, Zod
- **Database & Auth**: PostgreSQL, Prisma ORM, Auth.js / NextAuth
- **Payments**: Stripe (PaymentIntents, Elements UI, Idempotent Webhooks)
- **Testing**: Vitest, React Testing Library, jsdom (4-Layer SQA Matrix)

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/zain003/E-Commerce-Website.git
cd E-Commerce-Website
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 3. Run Database Migrations
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the store.

---

## Test Suites (SQA Matrix)
```bash
npm test          # Run all test suites
npm run test:ui   # Run Fake DOM component tests
npm run test:api  # Run API Route Handler tests
npm run test:unit # Run Unit & calculation tests
```

---

## Documentation & Feature Specifications
- Architecture: [`context/architecture.md`](./context/architecture.md)
- Code Standards: [`context/code-standards.md`](./context/code-standards.md)
- Testing Strategy: [`context/testing-strategy.md`](./context/testing-strategy.md)
- Feature Specs & Tracker: [`context/feature-specs/INDEX.md`](./context/feature-specs/INDEX.md)
