import { describe, expect, it } from "vitest";
import {
  budgetUpsertSchema,
  loginSchema,
  registerSchema,
  transactionCategorySchema,
} from "@/lib/validators";

describe("validators", () => {
  it("validates register payload", () => {
    expect(
      registerSchema.parse({
        name: "Ana",
        email: "ANA@example.com",
        password: "12345678",
      }).email,
    ).toBe("ana@example.com");
  });

  it("rejects short login password", () => {
    expect(() =>
      loginSchema.parse({
        email: "ana@example.com",
        password: "123",
      }),
    ).toThrow();
  });

  it("requires a valid category update payload", () => {
    expect(
      transactionCategorySchema.parse({
        transactionId: "txn_123",
        category: "OUTROS",
      }),
    ).toBeTruthy();
  });

  it("validates monthly budget payloads", () => {
    expect(
      budgetUpsertSchema.parse({
        month: "2026-05-01",
        budgets: [{ category: "ALIMENTACAO", amount: 350.5 }],
      }),
    ).toMatchObject({
      month: "2026-05-01",
      budgets: [{ category: "ALIMENTACAO", amount: 350.5 }],
    });
  });
});
