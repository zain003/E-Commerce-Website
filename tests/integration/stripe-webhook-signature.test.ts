import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { handleStripeWebhook } from "@/lib/services/order-creation";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest } from "next/server";

vi.mock("@/lib/payments/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/payments/stripe")>();
  return {
    ...actual,
    stripe: {
      webhooks: {
        constructEvent: vi.fn(),
      },
    },
  };
});

describe("Stripe Webhook Signature Verification (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  it("rejects requests missing stripe-signature header with HTTP 400 and WEBHOOK_SIGNATURE_VERIFICATION_FAILED", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_123" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("WEBHOOK_SIGNATURE_VERIFICATION_FAILED");
  });

  it("rejects requests with invalid/tampered signature with HTTP 400 and WEBHOOK_SIGNATURE_VERIFICATION_FAILED", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      const err = new Error("No signatures found matching the expected signature for payload");
      (err as any).type = "StripeSignatureVerificationError";
      throw err;
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_invalid" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=12345,v1=invalid_signature",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("WEBHOOK_SIGNATURE_VERIFICATION_FAILED");
  });

  it("direct service call handleStripeWebhook throws error when signature verification fails", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Signature verification failed");
    });

    await expect(
      handleStripeWebhook("test raw payload", "invalid_sig")
    ).rejects.toThrow("WEBHOOK_SIGNATURE_VERIFICATION_FAILED");
  });

  it("processes request with valid signature and returns HTTP 200 with received: true", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_test_valid",
      type: "customer.created",
      data: { object: {} },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_test_valid" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=12345,v1=valid_signature",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.received).toBe(true);
  });
});
