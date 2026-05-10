import { InternalCategory, Prisma } from "@prisma/client";
import { startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import type { BudgetInput, DashboardSummary, TransactionFilters } from "@/types";
import {
  calculateBudgetProgress,
  calculateCurrentMonthTotals,
  calculateMonthlySeries,
  calculatePeriodComparison,
  calculateSpendingByCategory,
} from "@/server/dashboard-helpers";

function getCategoryWhere(category: InternalCategory) {
  return {
    OR: [{ internalCategory: category }, { customCategory: category }],
  } satisfies Prisma.TransactionWhereInput;
}

function buildTransactionWhere(userId: string, filters: TransactionFilters) {
  const andConditions: Prisma.TransactionWhereInput[] = [{ userId }];

  if (filters.category && filters.category !== "ALL") {
    andConditions.push(getCategoryWhere(filters.category));
  }

  if (filters.direction && filters.direction !== "ALL") {
    andConditions.push({
      direction: filters.direction,
    });
  }

  if (filters.query) {
    andConditions.push({
      OR: [
        { name: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
        {
          merchantName: {
            contains: filters.query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    });
  }

  if (filters.from || filters.to) {
    andConditions.push({
      date: {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      },
    });
  }

  return {
    AND: andConditions,
  };
}

function normalizeMonth(month?: string | Date) {
  const value = month ? new Date(month) : new Date();
  return startOfMonth(value);
}

export async function getMonthlyBudgets(userId: string, month?: string | Date) {
  const normalizedMonth = normalizeMonth(month);

  return db.budget.findMany({
    where: {
      userId,
      month: normalizedMonth,
    },
    orderBy: {
      category: "asc",
    },
  });
}

export async function upsertMonthlyBudgets(
  userId: string,
  budgets: BudgetInput[],
  month?: string | Date,
) {
  const normalizedMonth = normalizeMonth(month);

  const operations = budgets.map((budget) =>
    db.budget.upsert({
      where: {
        userId_month_category: {
          userId,
          month: normalizedMonth,
          category: budget.category,
        },
      },
      update: {
        amount: new Prisma.Decimal(budget.amount.toFixed(2)),
      },
      create: {
        userId,
        month: normalizedMonth,
        category: budget.category,
        amount: new Prisma.Decimal(budget.amount.toFixed(2)),
      },
    }),
  );

  return Promise.all(operations);
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const currentMonth = normalizeMonth();

  const [accounts, transactions, latestItem, budgets] = await Promise.all([
    db.account.findMany({
      where: { userId },
      select: {
        currentBalance: true,
      },
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        amount: true,
        direction: true,
        date: true,
        internalCategory: true,
        customCategory: true,
      },
    }),
    db.plaidItem.findFirst({
      where: { userId },
      orderBy: { lastSyncedAt: "desc" },
      select: { lastSyncedAt: true },
    }),
    getMonthlyBudgets(userId, currentMonth),
  ]);

  const totals = calculateCurrentMonthTotals(transactions);
  const budgetsProgress = calculateBudgetProgress({
    budgets: budgets.map((budget) => ({
      category: budget.category,
      amount: Number(budget.amount),
    })),
    transactions,
  });
  const totalBudgetedMonth = budgetsProgress.reduce(
    (sum, budget) => sum + budget.budgeted,
    0,
  );
  const remainingBudgetMonth = budgetsProgress.reduce(
    (sum, budget) => sum + budget.remaining,
    0,
  );

  return {
    totalBalance: accounts.reduce(
      (sum, account) => sum + Number(account.currentBalance ?? 0),
      0,
    ),
    totalSpentMonth: totals.totalSpentMonth,
    totalIncomeMonth: totals.totalIncomeMonth,
    totalTransactions: transactions.length,
    latestSyncAt: latestItem?.lastSyncedAt?.toISOString() ?? null,
    byCategory: calculateSpendingByCategory(transactions),
    monthlyTrend: calculateMonthlySeries(transactions),
    comparison: calculatePeriodComparison(transactions),
    budgets: budgetsProgress,
    totalBudgetedMonth,
    remainingBudgetMonth,
  };
}

export async function getRecentTransactions(userId: string, limit = 8) {
  return db.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      account: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getAccounts(userId: string) {
  return db.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      plaidItem: {
        select: {
          institutionName: true,
        },
      },
    },
  });
}

export async function getAccountDetail(userId: string, accountId: string) {
  const account = await db.account.findFirst({
    where: { id: accountId, userId },
    include: {
      plaidItem: {
        select: {
          institutionName: true,
        },
      },
      transactions: {
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      accountId: account.id,
    },
    orderBy: { date: "desc" },
    select: {
      amount: true,
      direction: true,
      date: true,
      internalCategory: true,
      customCategory: true,
      merchantName: true,
      name: true,
      isoCurrencyCode: true,
      id: true,
    },
  });

  return {
    account,
    totals: calculateCurrentMonthTotals(transactions),
    comparison: calculatePeriodComparison(transactions),
    byCategory: calculateSpendingByCategory(transactions),
    monthlyTrend: calculateMonthlySeries(transactions),
    transactionCount: transactions.length,
  };
}

export async function getCategoryDetail(userId: string, category: InternalCategory) {
  const where = {
    userId,
    ...getCategoryWhere(category),
  } satisfies Prisma.TransactionWhereInput;

  const [transactions, currentBudget] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.budget.findFirst({
      where: {
        userId,
        category,
        month: normalizeMonth(),
      },
    }),
  ]);

  const transactionMetrics = transactions.map((transaction) => ({
    amount: transaction.amount,
    direction: transaction.direction,
    date: transaction.date,
    internalCategory: transaction.internalCategory,
    customCategory: transaction.customCategory,
  }));

  const spendingByAccount = transactions
    .filter((transaction) => transaction.direction === "EXPENSE")
    .reduce(
      (map, transaction) => {
        const key = transaction.account.name;
        map.set(key, (map.get(key) ?? 0) + Number(transaction.amount));
        return map;
      },
      new Map<string, number>(),
    );

  return {
    category,
    budget: currentBudget ? Number(currentBudget.amount) : 0,
    totals: calculateCurrentMonthTotals(transactionMetrics),
    comparison: calculatePeriodComparison(transactionMetrics),
    monthlyTrend: calculateMonthlySeries(transactionMetrics),
    recentTransactions: transactions.slice(0, 20),
    spendingByAccount: Array.from(spendingByAccount.entries())
      .map(([accountName, amount]) => ({ accountName, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export async function getPlaidItems(userId: string) {
  return db.plaidItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          accounts: true,
          transactions: true,
        },
      },
    },
  });
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters & { page: number; pageSize: number },
) {
  const where = buildTransactionWhere(userId, filters);

  const [items, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: {
        account: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.transaction.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function updateTransactionCategory(
  userId: string,
  transactionId: string,
  category: InternalCategory,
) {
  const transaction = await db.transaction.findFirst({
    where: { id: transactionId, userId },
    select: { id: true },
  });

  if (!transaction) {
    throw new Error("TRANSACTION_NOT_FOUND");
  }

  return db.transaction.update({
    where: { id: transaction.id },
    data: {
      customCategory: category,
    },
  });
}
