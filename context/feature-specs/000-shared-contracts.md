# 000 — Shared Contracts & Global Architecture
**Priority**: P0 (Core Foundation)  
**Layer**: Core System Contracts & Schemas  
**Target Path**: `src/types/`, `prisma/schema.prisma`, `src/lib/contracts/`

---

## 1. Naming & Folder Conventions
- **Files**: kebab-case (`product-card.tsx`, `cart-store.ts`, `route.ts`)
- **Components**: PascalCase (`ProductCard`, `CartDrawer`)
- **Functions/Hooks**: camelCase (`getProducts()`, `useCartStore()`)
- **Types/Interfaces/Enums**: PascalCase (`Product`, `ApiResponse<T>`, `OrderStatus`)
- **Database Tables/Models**: PascalCase in Prisma, singular (`Product`, `Order`, `User`)
- **Folders**: `src/app/`, `src/components/ui/`, `src/lib/`, `src/store/`, `src/types/`

---

## 2. Global Enums & Core Types

```typescript
export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus = 
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 3. Prisma Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING_PAYMENT
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

model User {
  id            String     @id @default(cuid())
  name          String?
  email         String     @unique
  passwordHash  String?
  role          Role       @default(CUSTOMER)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  wishlistItems WishlistItem[]
  cart          Cart?
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName    String
  street      String
  city        String
  state       String
  postalCode  String
  country     String
  phone       String
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  imageUrl    String?
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id          String         @id @default(cuid())
  name        String
  slug        String         @unique
  description String
  basePrice   Decimal        @db.Decimal(10, 2)
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  images      String[]
  featured    Boolean        @default(false)
  isArchived  Boolean        @default(false)
  variants    ProductVariant[]
  reviews     Review[]
  wishlist    WishlistItem[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model ProductVariant {
  id         String      @id @default(cuid())
  productId  String
  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku        String      @unique
  name       String      // e.g., "Medium / Black"
  priceDelta Decimal     @default(0.00) @db.Decimal(10, 2)
  stock      Int         @default(0)
  cartItems  CartItem[]
  orderItems OrderItem[]
}

model Cart {
  id          String     @id @default(cuid())
  userId      String?    @unique
  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  guestToken  String?    @unique
  items       CartItem[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model CartItem {
  id        String         @id @default(cuid())
  cartId    String
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  quantity  Int            @default(1)
  createdAt DateTime       @default(now())
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String?
  user            User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  guestEmail      String?
  status          OrderStatus   @default(PENDING_PAYMENT)
  paymentStatus   PaymentStatus @default(PENDING)
  stripePaymentId String?       @unique
  subtotal        Decimal       @db.Decimal(10, 2)
  discountTotal   Decimal       @default(0.00) @db.Decimal(10, 2)
  shippingFee     Decimal       @default(0.00) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  shippingAddress Json
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id        String         @id @default(cuid())
  orderId   String
  order     Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unitPrice Decimal        @db.Decimal(10, 2)
  quantity  Int
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int
  title     String?
  comment   String
  createdAt DateTime @default(now())
}

model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model Coupon {
  id            String       @id @default(cuid())
  code          String       @unique
  discountType  DiscountType
  discountValue Decimal      @db.Decimal(10, 2)
  minSpend      Decimal?     @db.Decimal(10, 2)
  maxUses       Int?
  usedCount     Int          @default(0)
  expiresAt     DateTime?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
}
```

---

## 4. Auth & Permissions Model
- **Roles**: `CUSTOMER` (default), `ADMIN`
- **Access Pattern**:
  ```typescript
  export interface AuthSession {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
    };
  }

  export function requireAuth(session: AuthSession | null): asserts session is AuthSession {
    if (!session || !session.user) {
      throw new Error("UNAUTHORIZED");
    }
  }

  export function requireAdmin(session: AuthSession | null): asserts session is AuthSession {
    requireAuth(session);
    if (session.user.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }
  }
  ```

---

## 5. Cross-Cutting Error & Response Envelope
- HTTP Status Codes:
  - `200 OK` / `201 Created`
  - `400 Bad Request` (Zod validation failure: `VALIDATION_ERROR`)
  - `401 Unauthorized` (`UNAUTHORIZED`)
  - `403 Forbidden` (`FORBIDDEN`)
  - `404 Not Found` (`NOT_FOUND`)
  - `409 Conflict` (`CONFLICT`)
  - `500 Internal Server Error` (`INTERNAL_SERVER_ERROR`)

---

## 6. Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FILE-ID] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block on it unless it affects the data model defined in `000-shared-contracts.md`, in which case STOP and flag for human review.
