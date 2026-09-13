import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  updateVariantStockSchema,
  adminProductQuerySchema,
  createVariantSchema,
} from "@/lib/validators/admin-product";

describe("Admin Product Validators (Unit)", () => {
  describe("createVariantSchema", () => {
    it("validates valid variant payload", () => {
      const validVariant = {
        sku: "PROD-SM-BLK",
        name: "Small / Black",
        priceDelta: 0,
        stock: 15,
      };

      const result = createVariantSchema.safeParse(validVariant);
      expect(result.success).toBe(true);
    });

    it("rejects empty SKU", () => {
      const invalidVariant = {
        sku: "   ",
        name: "Small / Black",
        priceDelta: 0,
        stock: 10,
      };

      const result = createVariantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.sku).toBeDefined();
      }
    });

    it("rejects negative stock", () => {
      const invalidVariant = {
        sku: "PROD-SM-BLK",
        name: "Small / Black",
        priceDelta: 0,
        stock: -1,
      };

      const result = createVariantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.stock).toBeDefined();
      }
    });

    it("rejects non-integer stock", () => {
      const invalidVariant = {
        sku: "PROD-SM-BLK",
        name: "Small / Black",
        priceDelta: 0,
        stock: 5.5,
      };

      const result = createVariantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.stock).toBeDefined();
      }
    });
  });

  describe("createProductSchema", () => {
    const validPayload = {
      name: "Classic Tee",
      slug: "classic-tee",
      description: "A comfortable organic cotton t-shirt.",
      basePrice: 29.99,
      categoryId: "cat_apparel",
      images: ["https://example.com/tee1.jpg"],
      featured: true,
      variants: [
        {
          sku: "TEE-M-BLK",
          name: "Medium / Black",
          priceDelta: 0,
          stock: 25,
        },
      ],
    };

    it("validates a fully formed valid product payload", () => {
      const result = createProductSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Classic Tee");
        expect(result.data.slug).toBe("classic-tee");
        expect(result.data.basePrice).toBe(29.99);
      }
    });

    it("rejects negative base price", () => {
      const payload = {
        ...validPayload,
        basePrice: -10,
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.basePrice).toBeDefined();
      }
    });

    it("rejects invalid slugs containing uppercase letters or spaces", () => {
      const uppercaseSlug = {
        ...validPayload,
        slug: "Classic-Tee",
      };
      expect(createProductSchema.safeParse(uppercaseSlug).success).toBe(false);

      const spacedSlug = {
        ...validPayload,
        slug: "classic tee",
      };
      expect(createProductSchema.safeParse(spacedSlug).success).toBe(false);

      const specialCharSlug = {
        ...validPayload,
        slug: "classic_tee$",
      };
      expect(createProductSchema.safeParse(specialCharSlug).success).toBe(false);
    });

    it("rejects missing required fields (name, description, categoryId)", () => {
      const invalid = {
        ...validPayload,
        name: "",
        description: "",
        categoryId: "",
      };

      const result = createProductSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.name).toBeDefined();
        expect(errors.description).toBeDefined();
        expect(errors.categoryId).toBeDefined();
      }
    });

    it("requires at least one variant when creating a product", () => {
      const noVariants = {
        ...validPayload,
        variants: [],
      };

      const result = createProductSchema.safeParse(noVariants);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.variants).toBeDefined();
      }
    });
  });

  describe("updateProductSchema", () => {
    it("allows partial updates to product fields", () => {
      const partialUpdate = {
        name: "Updated Classic Tee",
        basePrice: 34.99,
        isArchived: true,
      };

      const result = updateProductSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Updated Classic Tee");
        expect(result.data.basePrice).toBe(34.99);
        expect(result.data.isArchived).toBe(true);
      }
    });

    it("rejects negative base price in update payload", () => {
      const result = updateProductSchema.safeParse({ basePrice: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.basePrice).toBeDefined();
      }
    });

    it("rejects invalid slug in update payload", () => {
      const result = updateProductSchema.safeParse({ slug: "Invalid Slug" });
      expect(result.success).toBe(false);
    });
  });

  describe("updateVariantStockSchema", () => {
    it("accepts valid zero and positive integer stock", () => {
      expect(updateVariantStockSchema.safeParse({ stock: 0 }).success).toBe(true);
      expect(updateVariantStockSchema.safeParse({ stock: 100 }).success).toBe(true);
    });

    it("rejects negative stock number", () => {
      const result = updateVariantStockSchema.safeParse({ stock: -10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.stock).toBeDefined();
      }
    });

    it("rejects non-integer stock number", () => {
      const result = updateVariantStockSchema.safeParse({ stock: 12.3 });
      expect(result.success).toBe(false);
    });
  });

  describe("adminProductQuerySchema", () => {
    it("parses valid pagination parameters and sets defaults", () => {
      const parsed = adminProductQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
    });

    it("parses custom string numbers correctly", () => {
      const parsed = adminProductQuerySchema.parse({ page: "3", limit: "25" });
      expect(parsed.page).toBe(3);
      expect(parsed.limit).toBe(25);
    });

    it("clamps or rejects invalid page / limit numbers", () => {
      const invalid = adminProductQuerySchema.safeParse({ page: "0", limit: "-5" });
      expect(invalid.success).toBe(false);
    });
  });
});
