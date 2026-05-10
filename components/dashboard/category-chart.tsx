"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useElementSize } from "@/hooks/use-element-size";
import { internalCategoryLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "var(--chart-category-1)",
  "var(--chart-category-2)",
  "var(--chart-category-3)",
  "var(--chart-category-4)",
  "var(--chart-category-5)",
  "var(--chart-category-6)",
  "var(--chart-category-7)",
  "var(--chart-category-8)",
  "var(--chart-category-9)",
];

export function CategoryChart({
  data,
}: {
  data: Array<{ category: keyof typeof internalCategoryLabels; amount: number }>;
}) {
  const { ref, width, height, isReady } = useElementSize<HTMLDivElement>();

  return (
    <Card className="panel-tint min-w-0 border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
        <CardDescription>Distribuição consolidada das despesas sincronizadas.</CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="h-72 min-h-72 min-w-0" ref={ref}>
          {isReady ? (
            <PieChart height={height} width={width}>
              <Pie
                data={data}
                dataKey="amount"
                innerRadius={70}
                nameKey="category"
                outerRadius={110}
                cx="50%"
                cy="50%"
              >
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
            </PieChart>
          ) : (
            <div className="chart-skeleton h-full w-full animate-pulse rounded-3xl" />
          )}
        </div>
        <div className="min-w-0 space-y-3">
          {data.length === 0 ? (
            <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
              Conecte uma conta e sincronize para visualizar o grafico.
            </div>
          ) : (
            data.map((item, index) => (
              <div className="surface-soft flex items-center justify-between rounded-2xl px-4 py-3" key={item.category}>
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <Link
                    className="text-sm font-medium transition hover:text-[var(--color-brand)]"
                    href={`/categories/${item.category}`}
                  >
                    {internalCategoryLabels[item.category]}
                  </Link>
                </div>
                <span className="text-muted text-sm">{formatCurrency(item.amount)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
