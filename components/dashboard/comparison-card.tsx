import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PeriodComparison } from "@/types";
import { formatCurrency } from "@/lib/utils";

function DeltaIndicator({ value, inverse = false }: { value: number; inverse?: boolean }) {
  if (value === 0) {
    return (
      <span className="text-muted inline-flex items-center gap-1 text-sm">
        <Minus className="h-4 w-4" />
        Estavel
      </span>
    );
  }

  const positive = value > 0;
  const isGood = inverse ? !positive : positive;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        isGood ? "text-positive" : "text-negative"
      }`}
    >
      <Icon className="h-4 w-4" />
      {formatCurrency(Math.abs(value))}
    </span>
  );
}

export function ComparisonCard({ comparison }: { comparison: PeriodComparison }) {
  return (
    <Card className="panel-tint border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Comparativo de periodo</CardTitle>
        <CardDescription>Mês atual versus mês anterior.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="surface-soft rounded-2xl p-4">
          <p className="data-label">Despesas</p>
          <p className="text-strong mt-2 text-2xl font-semibold">
            {formatCurrency(comparison.currentSpent)}
          </p>
          <p className="text-muted mt-2 text-sm">
            Mês anterior: {formatCurrency(comparison.previousSpent)}
          </p>
          <div className="mt-3">
            <DeltaIndicator inverse value={comparison.spentDelta} />
          </div>
        </div>
        <div className="surface-soft rounded-2xl p-4">
          <p className="data-label">Receitas</p>
          <p className="text-strong mt-2 text-2xl font-semibold">
            {formatCurrency(comparison.currentIncome)}
          </p>
          <p className="text-muted mt-2 text-sm">
            Mês anterior: {formatCurrency(comparison.previousIncome)}
          </p>
          <div className="mt-3">
            <DeltaIndicator value={comparison.incomeDelta} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
