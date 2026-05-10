"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useElementSize } from "@/hooks/use-element-size";
import { formatCurrency } from "@/lib/utils";

export function TrendChart({
  data,
}: {
  data: Array<{ month: string; expenses: number; income: number }>;
}) {
  const { ref, width, height, isReady } = useElementSize<HTMLDivElement>();

  return (
    <Card className="panel-tint min-w-0 border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Evolução mensal</CardTitle>
        <CardDescription>Receitas e despesas dos últimos meses.</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-80 min-h-80 min-w-0" ref={ref}>
          {isReady ? (
            <AreaChart data={data} height={height} width={width}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-income)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-income)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-expense)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-expense)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Area
                type="monotone"
                dataKey="income"
                fill="url(#incomeGradient)"
                stroke="var(--chart-income)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                fill="url(#expenseGradient)"
                stroke="var(--chart-expense)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <div className="chart-skeleton h-full w-full animate-pulse rounded-3xl" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
