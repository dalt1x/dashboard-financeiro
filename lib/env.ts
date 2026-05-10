import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  PLAID_CLIENT_ID: z.string().min(1),
  PLAID_SECRET: z.string().min(1),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),
  PLAID_PRODUCTS: z.string().default("transactions"),
  PLAID_COUNTRY_CODES: z.string().default("US"),
  PLAID_ACCESS_TOKEN_ENCRYPTION_KEY: z.string().min(32).optional(),
  PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID: z.string().min(1).default("current"),
  PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
  PLAID_SECRET: process.env.PLAID_SECRET,
  PLAID_ENV: process.env.PLAID_ENV ?? "sandbox",
  PLAID_PRODUCTS: process.env.PLAID_PRODUCTS ?? "transactions",
  PLAID_COUNTRY_CODES: process.env.PLAID_COUNTRY_CODES ?? "US",
  PLAID_ACCESS_TOKEN_ENCRYPTION_KEY: process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY,
  PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID:
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID ?? "current",
  PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS:
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS,
});
