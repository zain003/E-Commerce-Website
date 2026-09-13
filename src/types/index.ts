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

export interface RegisterDto {
  name?: string;
  email: string;
  password: string;
}

export interface AddressDto {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  passwordHash?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
}

export function requireAuth(session: AuthSession | null | undefined): asserts session is AuthSession {
  if (!session || !session.user || !session.user.id) {
    throw new Error("UNAUTHORIZED");
  }
}

export function requireAdmin(session: AuthSession | null | undefined): asserts session is AuthSession {
  requireAuth(session);
  if (session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
}

import type {
  Category,
  Product,
  ProductVariant,
  Cart,
  CartItem,
  Order,
  OrderItem,
} from "@prisma/client";
export type {
  Category,
  Product,
  ProductVariant,
  Cart,
  CartItem,
  Order,
  OrderItem,
};

export interface HydratedOrderItem extends OrderItem {
  variant: ProductVariant & { product: Product };
}

export interface HydratedOrder extends Order {
  items: HydratedOrderItem[];
}

export interface AddToCartDto {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface HydratedCartItem extends CartItem {
  variant: ProductVariant & { product: Product };
}

export interface HydratedCart extends Cart {
  items: HydratedCartItem[];
  subtotal: number;
  itemCount: number;
}

export interface ProductDetail extends Product {
  category: Category;
  variants: ProductVariant[];
}

export type SortOption = "price_asc" | "price_desc" | "newest" | "featured";

export interface SearchFilterParams {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export interface ShippingMethod {
  id: "STANDARD" | "EXPRESS";
  name: string;
  price: number;
  estimatedDays: string;
}

export interface CheckoutPreview {
  items: HydratedCart["items"];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  total: number;
  availableShippingMethods: ShippingMethod[];
}

export interface CheckoutSessionDto {
  shippingAddress: AddressDto;
  shippingMethodId: "STANDARD" | "EXPRESS";
  guestEmail?: string;
}

export interface CreatePaymentIntentDto {
  checkoutSession: CheckoutSessionDto;
  idempotencyKey?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface CreateProductVariantDto {
  sku: string;
  name: string;
  priceDelta: number;
  stock: number;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  featured?: boolean;
  variants: CreateProductVariantDto[];
}

export type UpdateProductDto = Partial<CreateProductDto> & { isArchived?: boolean };

export interface UpdateVariantStockDto {
  stock: number;
}

export type AdminProduct = Product & {
  category: Category;
  variants: ProductVariant[];
};

