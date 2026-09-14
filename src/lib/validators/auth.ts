import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name cannot exceed 100 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
