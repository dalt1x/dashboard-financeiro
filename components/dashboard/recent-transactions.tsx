import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { internalCategoryLabels } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export function RecentTransactions({
  transactions,
}: {
  transactions: Array<{
    id: string;
    name: string;
    account: { name: string };
    amount: unknown;
    direction: "INCOME" | "EXPENSE";
    customCategory: keyof typeof internalCategoryLabels | null;
    internalCategory: keyof typeof internalCategoryLabels;
    date: Date;
  }>;
}) {
  return (
    <Card className="panel-tint border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Transações recentes</CardTitle>
        <CardDescription>Movimentações mais novas salvas no banco.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
            Nenhuma transação sincronizada ainda.
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              className="surface-soft-hover flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
              key={transaction.id}
            >
              <div className="space-y-1">
                <p className="font-medium">{transaction.name}</p>
                <div className="text-muted flex flex-wrap items-center gap-2 text-xs">
                  <span>{transaction.account.name}</span>
                  <span>&middot;</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={transaction.direction === "EXPENSE" ? "danger" : "success"}
                >
                  {
                    internalCategoryLabels[
                      transaction.customCategory ?? transaction.internalCategory
                    ]
                  }
                </Badge>
                <span
                  className={
                    transaction.direction === "EXPENSE"
                      ? "text-negative"
                      : "text-positive"
                  }
                >
                  {transaction.direction === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(Number(transaction.amount))}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
