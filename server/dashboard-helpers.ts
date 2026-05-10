import { InternalCategory, type Transaction } from "@prisma/client";
import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { BudgetProgress, PeriodComparison } from "@/types";

export function calculateCurrentMonthTotals(transactions: Array<Pick<Transaction, "amount" | "direction" | "date">>) {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  return transactions.reduce(
    (acc, transaction) => {
      const transactionDate = new Date(transaction.date);

      if (transactionDate < start || transactionDate > end) {
        return acc;
      }

      const amount = Number(transaction.amount);

      if (transaction.direction === "EXPENSE") {
        acc.totalSpentMonth += amount;
      } else {
        acc.totalIncomeMonth += amount;
      }

      return acc;
    },
    {
      totalSpentMonth: 0,
      totalIncomeMonth: 0,
    },
  );
}

export function calculatePeriodComparison(
  transactions: Array<Pick<Transaction, "amount" | "direction" | "date">>,
): PeriodComparison {
  const currentStart = startOfMonth(new Date());
  const currentEnd = endOfMonth(new Date());
  const previousReference = subMonths(new Date(), 1);
  const previousStart = startOfMonth(previousReference);
  const previousEnd = endOfMonth(previousReference);

  const comparison = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date);
      const amount = Number(transaction.amount);
      const isCurrent = isWithinInterval(date, { start: currentStart, end: currentEnd });
      const isPrevious = isWithinInterval(date, {
        start: previousStart,
        end: previousEnd,
      });

      if (!isCurrent && !isPrevious) {
        return acc;
      }

      if (transaction.direction === "EXPENSE") {
        if (isCurrent) acc.currentSpent += amount;
        if (isPrevious) acc.previousSpent += amount;
      } else {
        if (isCurrent) acc.currentIncome += amount;
        if (isPrevious) acc.previousIncome += amount;
      }

      return acc;
    },
    {
      currentSpent: 0,
      previousSpent: 0,
      currentIncome: 0,
      previousIncome: 0,
      spentDelta: 0,
      incomeDelta: 0,
    },
  );

  comparison.spentDelta = comparison.currentSpent - comparison.previousSpent;
  comparison.incomeDelta = comparison.currentIncome - comparison.previousIncome;

  return comparison;
}

export function calculateSpendingByCategory(
  transactions: Array<Pick<Transaction, "amount" | "direction" | "internalCategory" | "customCategory">>,
) {
  const totals = new Map<InternalCategory, number>();

  for (const transaction of transactions) {
    if (transaction.direction !== "EXPENSE") {
      continue;
    }

    const category = transaction.customCategory ?? transaction.internalCategory;
    totals.set(category, (totals.get(category) ?? 0) + Number(transaction.amount));
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function calculateMonthlySeries(
  transactions: Array<Pick<Transaction, "amount" | "direction" | "date">>,
  months = 6,
) {
  return Array.from({ length: months }, (_, index) => {
    const monthDate = subMonths(startOfMonth(new Date()), months - index - 1);
    const monthKey = format(monthDate, "yyyy-MM");

    const totals = transactions.reduce(
      (acc, transaction) => {
        const currentKey = format(new Date(transaction.date), "yyyy-MM");

        if (currentKey !== monthKey) {
          return acc;
        }

        const amount = Number(transaction.amount);

        if (transaction.direction === "EXPENSE") {
          acc.expenses += amount;
        } else {
          acc.income += amount;
        }

        return acc;
      },
      { expenses: 0, income: 0 },
    );

    return {
      month: format(monthDate, "MMM/yy"),
      expenses: totals.expenses,
      income: totals.income,
    };
  });
}

export function calculateBudgetProgress(params: {
  budgets: Array<{ category: InternalCategory; amount: number }>;
  transactions: Array<
    Pick<Transaction, "amount" | "direction" | "internalCategory" | "customCategory" | "date">
  >;
}): BudgetProgress[] {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const spendingByCategory = new Map<InternalCategory, number>();

  for (const transaction of params.transactions) {
    const date = new Date(transaction.date);

    if (
      transaction.direction !== "EXPENSE" ||
      !isWithinInterval(date, { start, end })
    ) {
      continue;
    }

    const category = transaction.customCategory ?? transaction.internalCategory;
    spendingByCategory.set(
      category,
      (spendingByCategory.get(category) ?? 0) + Number(transaction.amount),
    );
  }

  return params.budgets
    .map((budget) => {
      const spent = spendingByCategory.get(budget.category) ?? 0;
      const budgeted = Number(budget.amount);
      const remaining = budgeted - spent;

      return {
        category: budget.category,
        budgeted,
        spent,
        remaining,
        utilization: budgeted > 0 ? Math.min((spent / budgeted) * 100, 999) : 0,
      };
    })
    .sort((a, b) => b.spent - a.spent);
}
