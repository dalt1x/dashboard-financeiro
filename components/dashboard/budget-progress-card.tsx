import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { internalCategoryLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { BudgetProgress } from "@/types";

export function BudgetProgressCard({
  budgets,
  totalBudgeted,
  remaining,
}: {
  budgets: BudgetProgress[];
  totalBudgeted: number;
  remaining: number;
}) {
  return (
    <Card className="panel-tint border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Orcamentos mensais</CardTitle>
        <CardDescription>
          Planejamento por categoria com acompanhamento em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-soft rounded-2xl p-4">
            <p className="data-label">Planejado</p>
            <p className="text-strong mt-2 text-2xl font-semibold">
              {formatCurrency(totalBudgeted)}
            </p>
          </div>
          <div className="surface-soft rounded-2xl p-4">
            <p className="data-label">Saldo</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                remaining >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
            Defina orcamentos mensais em Configuracoes para acompanhar metas por categoria.
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.slice(0, 5).map((budget) => (
              <Link
                className="surface-soft-hover block rounded-2xl p-4"
                href={`/categories/${budget.category}`}
                key={budget.category}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-strong font-medium">{internalCategoryLabels[budget.category]}</p>
                    <p className="text-muted mt-1 text-sm">
                      Gasto {formatCurrency(budget.spent)} de{" "}
                      {formatCurrency(budget.budgeted)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      budget.remaining >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatCurrency(budget.remaining)}
                  </p>
                </div>
                <div className="surface-soft mt-3 h-2 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      budget.utilization <= 100 ? "bg-[var(--color-brand)]" : "bg-[var(--color-danger)]"
                    }`}
                    style={{ width: `${Math.min(budget.utilization, 100)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
