import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates user successfully and returns 201 with ApiResponse envelope", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "usr_123",
      name: "New User",
      email: "newuser@example.com",
      passwordHash: "hashed",
      role: "CUSTOMER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "New User",
        email: "NewUser@Example.com",
        password: "securepassword123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("usr_123");
    expect(data.data.email).toBe("newuser@example.com");
    expect(data.data.role).toBe("CUSTOMER");
    expect(data.timestamp).toBeDefined();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "newuser@example.com" },
    });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it("returns 409 EMAIL_EXISTS when email is already registered", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing_123",
      name: "Existing",
      email: "existing@example.com",
      passwordHash: "hash",
      role: "CUSTOMER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@example.com",
        password: "password123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("EMAIL_EXISTS");
    expect(data.error.message).toContain("already exists");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 400 VALIDATION_ERROR when password is shorter than 8 characters", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toHaveProperty("password");
  });

  it("returns 400 VALIDATION_ERROR when email format is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email-string",
        password: "validpassword123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toHaveProperty("email");
  });
});
