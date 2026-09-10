import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, addressSchema } from "@/lib/validators/auth";
import {
  ApiResponse,
  RegisterDto,
  AddressDto,
  Role,
  User,
  Address,
} from "@/types";

export class AuthServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "AuthServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export async function registerUser(
  dto: RegisterDto
): Promise<ApiResponse<{ id: string; email: string; role: Role }>> {
  const validated = registerSchema.safeParse(dto);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid registration payload",
        details: validated.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  const { email, password, name } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: {
        code: "EMAIL_EXISTS",
        message: "A user with this email already exists",
      },
      timestamp: new Date().toISOString(),
    };
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return {
    success: true,
    data: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as Role,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getCurrentUser(
  userId: string
): Promise<ApiResponse<{ user: User & { addresses: Address[] } }>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!user) {
    return {
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message: "User profile not found",
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses: user.addresses.map((addr) => ({
          id: addr.id,
          userId: addr.userId,
          fullName: addr.fullName,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
        })),
      },
    },
    timestamp: new Date().toISOString(),
  };
}

export async function createOrUpdateAddress(
  userId: string,
  dto: AddressDto,
  addressId?: string
): Promise<ApiResponse<Address>> {
  const validated = addressSchema.safeParse(dto);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid address payload",
        details: validated.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  const data = validated.data;

  // If addressId is provided, verify it exists and belongs to the user
  if (addressId) {
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Address not found",
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (existingAddress.userId !== userId) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not authorized to update this address",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    if (addressId) {
      return tx.address.update({
        where: { id: addressId },
        data: {
          fullName: data.fullName,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
          isDefault: data.isDefault ?? false,
        },
      });
    }

    return tx.address.create({
      data: {
        userId,
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault ?? false,
      },
    });
  });

  return {
    success: true,
    data: {
      id: result.id,
      userId: result.userId,
      fullName: result.fullName,
      street: result.street,
      city: result.city,
      state: result.state,
      postalCode: result.postalCode,
      country: result.country,
      phone: result.phone,
      isDefault: result.isDefault,
      createdAt: result.createdAt,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<ApiResponse<{ deletedId: string }>> {
  const existing = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Address not found",
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (existing.userId !== userId) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You are not authorized to delete this address",
      },
      timestamp: new Date().toISOString(),
    };
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return {
    success: true,
    data: { deletedId: addressId },
    timestamp: new Date().toISOString(),
  };
}
