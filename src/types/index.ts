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
