import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as createAddress } from "@/app/api/account/addresses/route";
import { DELETE as deleteAddressRoute, PUT as updateAddressRoute } from "@/app/api/account/addresses/[id]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    address: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Account Addresses API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/account/addresses", () => {
    it("returns 401 UNAUTHORIZED when session is missing", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/account/addresses", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test",
          street: "123 St",
          city: "City",
          state: "ST",
          postalCode: "12345",
          country: "USA",
          phone: "1234567890",
        }),
      });

      const res = await createAddress(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 VALIDATION_ERROR when address fields are invalid", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      const req = new NextRequest("http://localhost:3000/api/account/addresses", {
        method: "POST",
        body: JSON.stringify({ fullName: "" }),
      });

      const res = await createAddress(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("creates address and resets previous default if isDefault is true", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      const mockCreatedAddress = {
        id: "addr_new",
        userId: "usr_1",
        fullName: "Default User",
        street: "789 Elm St",
        city: "Town",
        state: "CA",
        postalCode: "90001",
        country: "USA",
        phone: "555-9999",
        isDefault: true,
        createdAt: new Date(),
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          address: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            create: vi.fn().mockResolvedValue(mockCreatedAddress),
          },
        };
        return (callback as unknown as (arg: typeof tx) => Promise<typeof mockCreatedAddress>)(tx);
      });

      const req = new NextRequest("http://localhost:3000/api/account/addresses", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Default User",
          street: "789 Elm St",
          city: "Town",
          state: "CA",
          postalCode: "90001",
          country: "USA",
          phone: "555-9999",
          isDefault: true,
        }),
      });

      const res = await createAddress(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("addr_new");
      expect(data.data.isDefault).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/account/addresses/[id]", () => {
    it("returns 401 UNAUTHORIZED when not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/account/addresses/addr_1", {
        method: "DELETE",
      });

      const res = await deleteAddressRoute(req, {
        params: Promise.resolve({ id: "addr_1" }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 404 NOT_FOUND when address does not exist", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      vi.mocked(prisma.address.findUnique).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/account/addresses/nonexistent", {
        method: "DELETE",
      });

      const res = await deleteAddressRoute(req, {
        params: Promise.resolve({ id: "nonexistent" }),
      });
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 403 FORBIDDEN when attempting to delete another user's address", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      vi.mocked(prisma.address.findUnique).mockResolvedValue({
        id: "addr_other",
        userId: "usr_other_user",
        fullName: "Other User",
        street: "123 Other",
        city: "Other",
        state: "OT",
        postalCode: "12345",
        country: "USA",
        phone: "1234567890",
        isDefault: false,
        createdAt: new Date(),
      });

      const req = new NextRequest("http://localhost:3000/api/account/addresses/addr_other", {
        method: "DELETE",
      });

      const res = await deleteAddressRoute(req, {
        params: Promise.resolve({ id: "addr_other" }),
      });
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.error.code).toBe("FORBIDDEN");
      expect(prisma.address.delete).not.toHaveBeenCalled();
    });

    it("successfully deletes own address and returns 200 with deletedId", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      const mockAddr = {
        id: "addr_1",
        userId: "usr_1",
        fullName: "User",
        street: "123 St",
        city: "City",
        state: "ST",
        postalCode: "12345",
        country: "USA",
        phone: "1234567890",
        isDefault: false,
        createdAt: new Date(),
      };

      vi.mocked(prisma.address.findUnique).mockResolvedValue(mockAddr);
      vi.mocked(prisma.address.delete).mockResolvedValue(mockAddr);

      const req = new NextRequest("http://localhost:3000/api/account/addresses/addr_1", {
        method: "DELETE",
      });

      const res = await deleteAddressRoute(req, {
        params: Promise.resolve({ id: "addr_1" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.deletedId).toBe("addr_1");
      expect(prisma.address.delete).toHaveBeenCalledWith({
        where: { id: "addr_1" },
      });
    });
  });

  describe("PUT /api/account/addresses/[id]", () => {
    it("updates own address and returns 200", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "User" },
        expires: "9999-12-31",
      });

      const existingAddr = {
        id: "addr_1",
        userId: "usr_1",
        fullName: "Existing Name",
        street: "123 St",
        city: "City",
        state: "ST",
        postalCode: "12345",
        country: "USA",
        phone: "1234567890",
        isDefault: false,
        createdAt: new Date(),
      };

      vi.mocked(prisma.address.findUnique).mockResolvedValue(existingAddr);

      const updatedAddr = {
        id: "addr_1",
        userId: "usr_1",
        fullName: "Updated Name",
        street: "456 Oak St",
        city: "Metropolis",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phone: "555-4321",
        isDefault: false,
        createdAt: new Date(),
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          address: {
            updateMany: vi.fn(),
            update: vi.fn().mockResolvedValue(updatedAddr),
          },
        };
        return (callback as unknown as (arg: typeof tx) => Promise<typeof updatedAddr>)(tx);
      });

      const req = new NextRequest("http://localhost:3000/api/account/addresses/addr_1", {
        method: "PUT",
        body: JSON.stringify({
          fullName: "Updated Name",
          street: "456 Oak St",
          city: "Metropolis",
          state: "NY",
          postalCode: "10001",
          country: "USA",
          phone: "555-4321",
          isDefault: false,
        }),
      });

      const res = await updateAddressRoute(req, {
        params: Promise.resolve({ id: "addr_1" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.fullName).toBe("Updated Name");
    });
  });
});
