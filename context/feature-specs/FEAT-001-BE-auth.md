# FEAT-001-BE — Auth & Account Service
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & API

## Goal
Provide secure credentials authentication, customer registration, session retrieval, and profile/address CRUD using Auth.js/NextAuth and Prisma.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Role, User, Address, ApiResponse } from "@/types";

export interface RegisterDto {
  name?: string;
  email: string;
  password: string;
}

export interface AddressDto {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}
```

## Provides / Exposes
```typescript
export async function registerUser(dto: RegisterDto): Promise<ApiResponse<{ id: string; email: string; role: Role }>>;
export async function getCurrentUser(): Promise<ApiResponse<{ user: User & { addresses: Address[] } }>>;
export async function createOrUpdateAddress(dto: AddressDto, addressId?: string): Promise<ApiResponse<Address>>;
export async function deleteAddress(addressId: string): Promise<ApiResponse<{ deletedId: string }>>;

// Route Handlers:
// POST /api/auth/register -> registerUser
// GET  /api/account/profile -> getCurrentUser
// POST /api/account/addresses -> createOrUpdateAddress
// DELETE /api/account/addresses/:id -> deleteAddress
```

## Scope (In)
- User registration with bcrypt/argon2 password hashing (minimum 8 chars).
- Validation schema with Zod for register, login, and address payloads.
- Address management (create, update, delete, set default).
- Auth.js session callback injecting user ID and Role (`CUSTOMER` / `ADMIN`).

## Scope (Out)
- Login/Register form UI (covered in `FEAT-001-FE-auth.md`).
- OAuth/Social login integrations (Phase 2).

## Tech / Files to Touch
- `src/lib/auth.ts` (NextAuth configuration & handlers)
- `src/lib/validators/auth.ts` (Zod schemas)
- `src/app/api/auth/register/route.ts`
- `src/app/api/account/profile/route.ts`
- `src/app/api/account/addresses/route.ts`
- `src/app/api/account/addresses/[id]/route.ts`

## Tests to Write FIRST
1. `tests/unit/auth-validator.test.ts`: Rejects invalid emails and passwords < 8 chars.
2. `tests/api/auth-register.test.ts`: Rejects duplicate email with `409 CONFLICT`; creates user with `201`.
3. `tests/api/account-address.test.ts`: Requires active session; sets single `isDefault: true` per user.

## Implementation Steps
1. Define Zod validation schemas (`registerSchema`, `addressSchema`) in `src/lib/validators/auth.ts`.
2. Configure Auth.js Credentials Provider with bcrypt password verification in `src/lib/auth.ts`.
3. Implement `POST /api/auth/register` with duplicate email check and hash storage.
4. Implement `GET /api/account/profile` with session verification.
5. Implement `POST /api/account/addresses` and `DELETE /api/account/addresses/[id]` with user ownership validation.

## Acceptance Criteria
- [ ] Attempting to register an existing email returns HTTP `409` with error code `"EMAIL_EXISTS"`.
- [ ] Passwords shorter than 8 characters fail Zod parsing with HTTP `400`.
- [ ] Setting an address as `isDefault: true` automatically unsets previous default addresses for that user.
- [ ] Unauthenticated requests to `/api/account/*` return HTTP `401`.

## Definition of Done
- [ ] Unit & API tests passing 100%.
- [ ] TypeScript compilation zero errors.
- [ ] Lint check clean.

## Edge Cases to Handle
- Whitespace trimming on email inputs.
- Deleting an address that does not belong to the authenticated session returns `403 FORBIDDEN`.

## Pre-flight Check
- Confirm `000-shared-contracts.md` schema is in sync with Prisma setup.

## What's Next
- `FEAT-001-FE-auth.md` (Frontend UI for Authentication and Profile).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-001-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
