import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/account/profile/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/account/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 UNAUTHORIZED when session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 200 and user profile with addresses when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });

    const mockDate = new Date();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "usr_1",
      email: "user@test.com",
      passwordHash: "hash",
      name: "Alice",
      role: "CUSTOMER",
      createdAt: mockDate,
      updatedAt: mockDate,
      addresses: [
        {
          id: "addr_1",
          userId: "usr_1",
          fullName: "Alice Smith",
          street: "123 Maple St",
          city: "Springfield",
          state: "IL",
          postalCode: "62701",
          country: "USA",
          phone: "555-1234",
          isDefault: true,
          createdAt: mockDate,
        },
      ],
    } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe("user@test.com");
    expect(data.data.user.addresses).toHaveLength(1);
    expect(data.data.user.addresses[0].fullName).toBe("Alice Smith");
  });

  it("returns 404 USER_NOT_FOUND if user does not exist in database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "nonexistent", email: "ghost@test.com", role: "CUSTOMER", name: null },
      expires: "9999-12-31",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("USER_NOT_FOUND");
  });
});
