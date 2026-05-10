import { subMonths } from "date-fns";
import { describe, expect, it } from "vitest";
import { InternalCategory, TransactionDirection } from "@prisma/client";
import {
  calculateBudgetProgress,
  calculateCurrentMonthTotals,
  calculateMonthlySeries,
  calculatePeriodComparison,
  calculateSpendingByCategory,
} from "@/server/dashboard-helpers";

const now = new Date();

describe("dashboard helpers", () => {
  it("calculates month totals", () => {
    const result = calculateCurrentMonthTotals([
      { amount: 120.5 as never, direction: TransactionDirection.EXPENSE, date: now },
      { amount: 3200 as never, direction: TransactionDirection.INCOME, date: now },
    ]);

    expect(result.totalSpentMonth).toBe(120.5);
    expect(result.totalIncomeMonth).toBe(3200);
  });

  it("groups expense totals by category", () => {
    const result = calculateSpendingByCategory([
      {
        amount: 80 as never,
        direction: TransactionDirection.EXPENSE,
        internalCategory: InternalCategory.ALIMENTACAO,
        customCategory: null,
      },
      {
        amount: 40 as never,
        direction: TransactionDirection.EXPENSE,
        internalCategory: InternalCategory.ALIMENTACAO,
        customCategory: InternalCategory.COMPRAS,
      },
    ]);

    expect(result).toEqual([
      { category: InternalCategory.ALIMENTACAO, amount: 80 },
      { category: InternalCategory.COMPRAS, amount: 40 },
    ]);
  });

  it("creates a monthly series with fixed length", () => {
    const result = calculateMonthlySeries(
      [{ amount: 120 as never, direction: TransactionDirection.EXPENSE, date: now }],
      3,
    );

    expect(result).toHaveLength(3);
    expect(result.at(-1)?.expenses).toBe(120);
  });

  it("compares the current month with the previous month", () => {
    const result = calculatePeriodComparison([
      { amount: 200 as never, direction: TransactionDirection.EXPENSE, date: now },
      { amount: 800 as never, direction: TransactionDirection.INCOME, date: now },
      {
        amount: 120 as never,
        direction: TransactionDirection.EXPENSE,
        date: subMonths(now, 1),
      },
      {
        amount: 500 as never,
        direction: TransactionDirection.INCOME,
        date: subMonths(now, 1),
      },
    ]);

    expect(result).toMatchObject({
      currentSpent: 200,
      previousSpent: 120,
      currentIncome: 800,
      previousIncome: 500,
      spentDelta: 80,
      incomeDelta: 300,
    });
  });

  it("calculates budget utilization by category for the current month", () => {
    const result = calculateBudgetProgress({
      budgets: [
        { category: InternalCategory.ALIMENTACAO, amount: 400 },
        { category: InternalCategory.MORADIA, amount: 1200 },
      ],
      transactions: [
        {
          amount: 150 as never,
          direction: TransactionDirection.EXPENSE,
          internalCategory: InternalCategory.ALIMENTACAO,
          customCategory: null,
          date: now,
        },
        {
          amount: 100 as never,
          direction: TransactionDirection.EXPENSE,
          internalCategory: InternalCategory.ALIMENTACAO,
          customCategory: InternalCategory.MORADIA,
          date: now,
        },
        {
          amount: 90 as never,
          direction: TransactionDirection.EXPENSE,
          internalCategory: InternalCategory.ALIMENTACAO,
          customCategory: null,
          date: subMonths(now, 1),
        },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      category: InternalCategory.ALIMENTACAO,
      budgeted: 400,
      spent: 150,
      remaining: 250,
      utilization: 37.5,
    });
    expect(result[1]).toMatchObject({
      category: InternalCategory.MORADIA,
      budgeted: 1200,
      spent: 100,
      remaining: 1100,
    });
    expect(result[1]?.utilization).toBeCloseTo(8.3333333333, 6);
  });
});
