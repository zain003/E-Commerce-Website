import { z } from "zod";
import { SearchFilterParams, SortOption } from "@/types";

const SORT_OPTIONS = ["price_asc", "price_desc", "newest", "featured"] as const;

export const searchQuerySchema = z
  .object({
    query: z
      .string()
      .trim()
      .transform((val) => (val.length > 0 ? val : undefined))
      .optional(),
    categorySlug: z
      .string()
      .trim()
      .transform((val) => (val.length > 0 ? val : undefined))
      .optional(),
    minPrice: z
      .number({
        message: "minPrice must be a valid number",
      })
      .min(0, "minPrice must be greater than or equal to 0")
      .optional(),
    maxPrice: z
      .number({
        message: "maxPrice must be a valid number",
      })
      .min(0, "maxPrice must be greater than or equal to 0")
      .optional(),
    inStockOnly: z.boolean().optional(),
    sortBy: z.enum(SORT_OPTIONS).default("newest"),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(12),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.maxPrice >= data.minPrice;
      }
      return true;
    },
    {
      message: "maxPrice must be greater than or equal to minPrice",
      path: ["maxPrice"],
    }
  );

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export type ParseSearchResult =
  | { success: true; data: SearchFilterParams }
  | { success: false; error: z.ZodError };

/**
 * Normalizes input from URLSearchParams or record into a typed and validated SearchFilterParams.
 * Employs safe fallbacks for pagination parameters (page >= 1, limit between 1 and 100).
 */
export function parseSearchParams(
  input: URLSearchParams | Record<string, string | string[] | undefined>
): ParseSearchResult {
  const getParam = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) {
      return input.get(key) ?? undefined;
    }
    const val = input[key];
    if (Array.isArray(val)) {
      return val[0];
    }
    return val;
  };

  const rawQ = getParam("q") ?? getParam("query");
  const rawCategory = getParam("category") ?? getParam("categorySlug");
  const rawMinPrice = getParam("minPrice");
  const rawMaxPrice = getParam("maxPrice");
  const rawInStock = getParam("inStock") ?? getParam("inStockOnly");
  const rawSort = getParam("sort") ?? getParam("sortBy");
  const rawPage = getParam("page");
  const rawLimit = getParam("limit");

  // Safe pagination coercion
  let page = 1;
  if (rawPage !== undefined && rawPage !== null && rawPage.trim() !== "") {
    const parsedPage = parseInt(rawPage, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  let limit = 12;
  if (rawLimit !== undefined && rawLimit !== null && rawLimit.trim() !== "") {
    const parsedLimit = parseInt(rawLimit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 100);
    }
  }

  // Price parsing
  let minPrice: number | undefined = undefined;
  if (rawMinPrice !== undefined && rawMinPrice !== null && rawMinPrice.trim() !== "") {
    const parsed = Number(rawMinPrice);
    minPrice = isNaN(parsed) ? undefined : parsed;
  }

  let maxPrice: number | undefined = undefined;
  if (rawMaxPrice !== undefined && rawMaxPrice !== null && rawMaxPrice.trim() !== "") {
    const parsed = Number(rawMaxPrice);
    maxPrice = isNaN(parsed) ? undefined : parsed;
  }

  // InStock boolean coercion
  let inStockOnly: boolean | undefined = undefined;
  if (rawInStock !== undefined && rawInStock !== null) {
    const normalized = rawInStock.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      inStockOnly = true;
    } else if (normalized === "false" || normalized === "0") {
      inStockOnly = false;
    }
  }

  const rawObject: Record<string, unknown> = {
    query: rawQ,
    categorySlug: rawCategory,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy: rawSort || "newest",
    page,
    limit,
  };

  const result = searchQuerySchema.safeParse(rawObject);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: {
      query: result.data.query,
      categorySlug: result.data.categorySlug,
      minPrice: result.data.minPrice,
      maxPrice: result.data.maxPrice,
      inStockOnly: result.data.inStockOnly,
      sortBy: result.data.sortBy as SortOption,
      page: result.data.page,
      limit: result.data.limit,
    },
  };
}
