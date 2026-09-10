import { describe, it, expect } from "vitest";
import { registerSchema, addressSchema, loginSchema } from "@/lib/validators/auth";

describe("Auth Validation Schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration payload", () => {
      const valid = {
        name: "Test User",
        email: "test@example.com",
        password: "securepassword123",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
      }
    });

    it("trims and lowercases email address", () => {
      const payload = {
        email: "  User.Name@Example.COM  ",
        password: "password123",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user.name@example.com");
      }
    });

    it("rejects invalid email addresses", () => {
      const invalidEmails = ["notanemail", "missing@domain", "@nodomain.com", "space in@email.com"];
      for (const email of invalidEmails) {
        const result = registerSchema.safeParse({ email, password: "password123" });
        expect(result.success).toBe(false);
      }
    });

    it("rejects passwords shorter than 8 characters", () => {
      const shortPasswords = ["", "1234567", "short"];
      for (const password of shortPasswords) {
        const result = registerSchema.safeParse({
          email: "valid@example.com",
          password,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("at least 8 characters");
        }
      }
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login credentials", () => {
      const result = loginSchema.safeParse({
        email: "user@test.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty password or invalid email", () => {
      const res1 = loginSchema.safeParse({ email: "invalid", password: "pwd" });
      expect(res1.success).toBe(false);

      const res2 = loginSchema.safeParse({ email: "user@test.com", password: "" });
      expect(res2.success).toBe(false);
    });
  });

  describe("addressSchema", () => {
    it("accepts valid address data and defaults isDefault to false", () => {
      const payload = {
        fullName: "Jane Doe",
        street: "123 Main St",
        city: "Metropolis",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phone: "+1-555-0199",
      };
      const result = addressSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });

    it("rejects payload missing required address fields", () => {
      const incomplete = {
        fullName: "Jane Doe",
        city: "Metropolis",
      };
      const result = addressSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });
});
