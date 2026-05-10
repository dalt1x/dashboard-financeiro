import { describe, expect, it } from "vitest";
import { InternalCategory } from "@prisma/client";
import { mapPlaidCategoryToInternalCategory } from "@/lib/category-mapper";

describe("mapPlaidCategoryToInternalCategory", () => {
  it("maps grocery transactions to alimentacao", () => {
    expect(
      mapPlaidCategoryToInternalCategory({
        primary: "Food and Drink",
        detailed: "Groceries",
      }),
    ).toBe(InternalCategory.ALIMENTACAO);
  });

  it("maps payroll entries to salario", () => {
    expect(
      mapPlaidCategoryToInternalCategory({
        detailed: "Payroll",
      }),
    ).toBe(InternalCategory.SALARIO);
  });

  it("falls back to outros when no keyword is found", () => {
    expect(
      mapPlaidCategoryToInternalCategory({
        name: "Unknown service",
      }),
    ).toBe(InternalCategory.OUTROS);
  });
});
