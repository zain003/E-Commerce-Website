import { describe, it, expect } from "vitest";
import {
  checkoutAddressSchema,
  checkoutSessionSchema,
  validateCheckoutSessionInput,
} from "@/lib/validators/checkout";

describe("Checkout Validator (Unit)", () => {
  const validAddress = {
    fullName: "Jane Doe",
    street: "123 Market Street, Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    phone: "+1 (555) 019-2834",
  };

  describe("checkoutAddressSchema", () => {
    it("passes for a valid complete address with phone in international/national format", () => {
      const result = checkoutAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe("Jane Doe");
        expect(result.data.postalCode).toBe("94105");
      }
    });

    it("accepts various valid phone number formats", () => {
      const validPhones = [
        "+1234567890",
        "+1 (555) 123-4567",
        "123-456-7890",
        "555.123.4567",
        "+44 20 7946 0958",
        "(02) 1234 5678",
      ];

      for (const phone of validPhones) {
        const result = checkoutAddressSchema.safeParse({
          ...validAddress,
          phone,
        });
        expect(result.success).toBe(true);
      }
    });

    it("fails validation when phone number has fewer than 7 digits or invalid characters", () => {
      const invalidPhones = ["123", "abc", "phone123", "   ", "+++", "!@#$%"];

      for (const phone of invalidPhones) {
        const result = checkoutAddressSchema.safeParse({
          ...validAddress,
          phone,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          expect(errors.phone).toBeDefined();
        }
      }
    });

    it("accepts alphanumeric postal codes with hyphens and spaces", () => {
      const validPostalCodes = ["90210", "EC1A 1BB", "K1A-0B1", "10001-1234", "75008"];

      for (const postalCode of validPostalCodes) {
        const result = checkoutAddressSchema.safeParse({
          ...validAddress,
          postalCode,
        });
        expect(result.success).toBe(true);
      }
    });

    it("fails validation when postal code is empty, too short, or contains illegal characters", () => {
      const invalidPostalCodes = ["", "1", "90@10", "###", "     "];

      for (const postalCode of invalidPostalCodes) {
        const result = checkoutAddressSchema.safeParse({
          ...validAddress,
          postalCode,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          expect(errors.postalCode).toBeDefined();
        }
      }
    });

    it("fails validation when required address fields are missing or empty", () => {
      const emptyAddress = {
        fullName: "  ",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
      };

      const result = checkoutAddressSchema.safeParse(emptyAddress);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.fullName).toBeDefined();
        expect(errors.street).toBeDefined();
        expect(errors.city).toBeDefined();
        expect(errors.state).toBeDefined();
        expect(errors.country).toBeDefined();
      }
    });
  });

  describe("checkoutSessionSchema", () => {
    it("accepts STANDARD or EXPRESS as shippingMethodId", () => {
      const standard = checkoutSessionSchema.safeParse({
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
      });
      expect(standard.success).toBe(true);

      const express = checkoutSessionSchema.safeParse({
        shippingAddress: validAddress,
        shippingMethodId: "EXPRESS",
      });
      expect(express.success).toBe(true);
    });

    it("rejects unknown shippingMethodId", () => {
      const invalid = checkoutSessionSchema.safeParse({
        shippingAddress: validAddress,
        shippingMethodId: "OVERNIGHT",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("validateCheckoutSessionInput", () => {
    it("enforces guestEmail when isGuest is true", () => {
      const withoutEmail = validateCheckoutSessionInput(
        {
          shippingAddress: validAddress,
          shippingMethodId: "STANDARD",
        },
        true
      );
      expect(withoutEmail.success).toBe(false);
      expect(withoutEmail.error?.details?.guestEmail).toBeDefined();

      const withInvalidEmail = validateCheckoutSessionInput(
        {
          shippingAddress: validAddress,
          shippingMethodId: "STANDARD",
          guestEmail: "not-an-email",
        },
        true
      );
      expect(withInvalidEmail.success).toBe(false);
      expect(withInvalidEmail.error?.details?.guestEmail).toBeDefined();

      const withValidEmail = validateCheckoutSessionInput(
        {
          shippingAddress: validAddress,
          shippingMethodId: "STANDARD",
          guestEmail: "customer@example.com",
        },
        true
      );
      expect(withValidEmail.success).toBe(true);
      expect(withValidEmail.data?.guestEmail).toBe("customer@example.com");
    });

    it("allows omitting guestEmail when isGuest is false (authenticated user)", () => {
      const result = validateCheckoutSessionInput(
        {
          shippingAddress: validAddress,
          shippingMethodId: "STANDARD",
        },
        false
      );
      expect(result.success).toBe(true);
    });
  });
});
