import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl:
    process.env.NEON_AUTH_BASE_URL ||
    "https://ep-flat-haze-ay4q8wim.neonauth.us-east-2.aws.neon.build/neondb/auth",
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ||
      "dev-insecure-neon-auth-cookie-secret-min-32-chars",
  },
});
