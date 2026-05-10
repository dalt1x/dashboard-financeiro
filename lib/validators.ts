import { InternalCategory, TransactionDirection } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const plaidExchangeSchema = z.object({
  publicToken: z.string().min(1),
});

export const transactionCategorySchema = z.object({
  transactionId: z.string().min(1),
  category: z.nativeEnum(InternalCategory),
});

export const budgetUpsertSchema = z.object({
  budgets: z
    .array(
      z.object({
        category: z.nativeEnum(InternalCategory),
        amount: z.coerce.number().min(0).max(1_000_000),
      }),
    )
    .min(1),
  month: z.string().optional(),
});

export const transactionListSchema = z.object({
  category: z.nativeEnum(InternalCategory).or(z.literal("ALL")).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  direction: z.nativeEnum(TransactionDirection).or(z.literal("ALL")).optional(),
  query: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});
