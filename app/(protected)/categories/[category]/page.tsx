import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { internalCategoryLabels } from "@/lib/constants";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCategoryDetail } from "@/server/dashboard-service";
import { InternalCategory } from "@prisma/client";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryDetailPage({ params }: Props) {
  const user = await requireUser();
  const { category } = await params;

  if (!(category in InternalCategory)) {
    notFound();
  }

  const normalizedCategory = category as InternalCategory;
  const detail = await getCategoryDetail(user.id, normalizedCategory).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categoria"
        title={internalCategoryLabels[normalizedCategory]}
        description="Analise de desempenho, orcamento e distribuicao por conta para a categoria selecionada."
        actions={
          <Button asChild variant="secondary">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Gasto no mes</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(detail.totals.totalSpentMonth)}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Mes anterior</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(detail.comparison.previousSpent)}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Orcamento</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(detail.budget)}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Saldo da meta</p>
            <p
              className={`mt-2 text-3xl font-semibold ${
                detail.budget - detail.totals.totalSpentMonth >= 0
                  ? "text-positive"
                  : "text-negative"
              }`}
            >
              {formatCurrency(detail.budget - detail.totals.totalSpentMonth)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TrendChart data={detail.monthlyTrend} />
        <Card className="panel-tint border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Distribuicao por conta</CardTitle>
            <CardDescription>Quanto cada conta contribuiu para essa categoria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.spendingByAccount.length === 0 ? (
              <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
                Nenhuma despesa registrada nesta categoria.
              </div>
            ) : (
              detail.spendingByAccount.map((account) => (
                <div className="surface-soft rounded-2xl p-4" key={account.accountName}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-strong font-medium">{account.accountName}</span>
                    <span className="text-muted text-sm">{formatCurrency(account.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="panel-tint border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Transacoes recentes</CardTitle>
          <CardDescription>
            Lancamentos vinculados a {internalCategoryLabels[normalizedCategory]}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.recentTransactions.length === 0 ? (
            <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
              Nenhuma transacao encontrada para esta categoria.
            </div>
          ) : (
            detail.recentTransactions.map((transaction) => (
              <div
                className="surface-soft flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
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
                  <Badge variant={transaction.direction === "EXPENSE" ? "danger" : "success"}>
                    {transaction.direction === "EXPENSE" ? "Saida" : "Entrada"}
                  </Badge>
                  <span
                    className={`text-sm font-medium ${
                      transaction.direction === "EXPENSE" ? "text-negative" : "text-positive"
                    }`}
                  >
                    {transaction.direction === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(Number(transaction.amount), transaction.isoCurrencyCode ?? "USD")}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
