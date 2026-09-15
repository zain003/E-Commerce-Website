import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/checkout/confirm/route";
import * as orderCreationService from "@/lib/services/order-creation";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/order-creation", () => ({
  createOrderFromPaymentIntent: vi.fn(),
}));

describe("POST /api/checkout/confirm (API Route)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost:3000/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 VALIDATION_ERROR when paymentIntentId is missing or empty", async () => {
    const req = createRequest({ paymentIntentId: "" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("successfully creates and confirms order from valid payment intent", async () => {
    const mockOrder = {
      id: "ord_confirm_123",
      orderNumber: "ORD-CONFIRM-123",
      total: 99.99,
      status: "PROCESSING",
    };

    vi.mocked(orderCreationService.createOrderFromPaymentIntent).mockResolvedValue(
      mockOrder as any
    );

    const req = createRequest({
      paymentIntentId: "pi_test_valid_123",
      guestEmail: "customer@example.com",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.orderNumber).toBe("ORD-CONFIRM-123");
    expect(json.data.orderId).toBe("ord_confirm_123");
    expect(orderCreationService.createOrderFromPaymentIntent).toHaveBeenCalledWith(
      "pi_test_valid_123"
    );
  });

  it("returns 400 ORDER_CREATION_FAILED when createOrderFromPaymentIntent returns null", async () => {
    vi.mocked(orderCreationService.createOrderFromPaymentIntent).mockResolvedValue(
      null
    );

    const req = createRequest({ paymentIntentId: "pi_test_empty_cart" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("ORDER_CREATION_FAILED");
  });

  it("returns 500 INTERNAL_SERVER_ERROR when order creation throws an exception", async () => {
    vi.mocked(orderCreationService.createOrderFromPaymentIntent).mockRejectedValue(
      new Error("Database connection lost")
    );

    const req = createRequest({ paymentIntentId: "pi_test_db_error" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(json.error.message).toBe("Database connection lost");
  });
});
