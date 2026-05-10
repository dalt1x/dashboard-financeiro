"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { categoryOptions, internalCategoryLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type BudgetRow = {
  category: string;
  amount: number;
};

export function BudgetPlanner({
  initialBudgets,
  monthLabel,
}: {
  initialBudgets: BudgetRow[];
  monthLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    () =>
      initialBudgets.reduce<Record<string, string>>((acc, item) => {
        acc[item.category] = String(item.amount);
        return acc;
      }, {}),
  );

  const total = useMemo(
    () =>
      Object.values(values).reduce((sum, value) => {
        const number = Number(value);
        return sum + (Number.isFinite(number) ? number : 0);
      }, 0),
    [values],
  );

  function handleSave() {
    startTransition(async () => {
      const payload = {
        budgets: categoryOptions.map((option) => ({
          category: option.value,
          amount: Number(values[option.value] ?? 0),
        })),
      };

      const response = await fetch("/api/budgets/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Nao foi possivel salvar os orçamentos.");
        return;
      }

      toast.success("Orçamentos mensais atualizados.");
      router.refresh();
    });
  }

  return (
    <Card className="panel-tint border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Orçamento mensal</CardTitle>
        <CardDescription>
          Planejamento de categorias para {monthLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {categoryOptions.map((option) => (
            <label className="surface-soft rounded-2xl p-4" key={option.value}>
              <span className="text-strong text-sm font-medium">
                {internalCategoryLabels[option.value]}
              </span>
              <Input
                className="mt-3"
                min="0"
                step="0.01"
                type="number"
                value={values[option.value] ?? "0"}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [option.value]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>

        <div className="surface-soft flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="data-label">Total planejado</p>
            <p className="text-strong mt-2 text-2xl font-semibold">{formatCurrency(total)}</p>
          </div>
          <Button disabled={isPending} onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar orçamentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
