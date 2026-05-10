import { InternalCategory, TransactionDirection } from "@prisma/client";

export type BudgetProgress = {
  category: InternalCategory;
  budgeted: number;
  spent: number;
  remaining: number;
  utilization: number;
};

export type PeriodComparison = {
  currentSpent: number;
  previousSpent: number;
  currentIncome: number;
  previousIncome: number;
  spentDelta: number;
  incomeDelta: number;
};

export type DashboardSummary = {
  totalBalance: number;
  totalSpentMonth: number;
  totalIncomeMonth: number;
  totalTransactions: number;
  latestSyncAt: string | null;
  byCategory: Array<{ category: InternalCategory; amount: number }>;
  monthlyTrend: Array<{ month: string; expenses: number; income: number }>;
  comparison: PeriodComparison;
  budgets: BudgetProgress[];
  totalBudgetedMonth: number;
  remainingBudgetMonth: number;
};

export type TransactionFilters = {
  category?: InternalCategory | "ALL";
  from?: string;
  to?: string;
  direction?: TransactionDirection | "ALL";
  query?: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type BudgetInput = {
  category: InternalCategory;
  amount: number;
};
