import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { ComparisonCard } from "@/components/dashboard/comparison-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getAccountDetail } from "@/server/dashboard-service";

type Props = {
  params: Promise<{ accountId: string }>;
};

export default async function AccountDetailPage({ params }: Props) {
  const user = await requireUser();
  const { accountId } = await params;
  const detail = await getAccountDetail(user.id, accountId).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conta"
        title={detail.account.name}
        description={`Detalhamento da conta ${detail.account.plaidItem.institutionName ?? "Sandbox institution"} com saldo, categorias e movimentacoes recentes.`}
        actions={
          <Button asChild variant="secondary">
            <Link href="/accounts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para contas
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Saldo atual</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(Number(detail.account.currentBalance ?? 0), detail.account.isoCurrencyCode ?? "USD")}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Saldo disponivel</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(Number(detail.account.availableBalance ?? 0), detail.account.isoCurrencyCode ?? "USD")}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Saidas no mes</p>
            <p className="text-strong mt-2 text-3xl font-semibold">
              {formatCurrency(detail.totals.totalSpentMonth)}
            </p>
          </CardContent>
        </Card>
        <Card className="panel-tint border-[var(--color-border)]">
          <CardContent className="pt-6">
            <p className="data-label">Movimentacoes</p>
            <p className="text-strong mt-2 text-3xl font-semibold">{detail.transactionCount}</p>
          </CardContent>
        </Card>
      </div>

      <ComparisonCard comparison={detail.comparison} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TrendChart data={detail.monthlyTrend} />
        <CategoryChart data={detail.byCategory} />
      </div>

      <Card className="panel-tint border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Movimentacoes recentes</CardTitle>
          <CardDescription>Ultimos lancamentos sincronizados para esta conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.account.transactions.length === 0 ? (
            <div className="empty-state rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
              Nenhuma transacao sincronizada para esta conta.
            </div>
          ) : (
            detail.account.transactions.map((transaction) => (
              <div
                className="surface-soft flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
                key={transaction.id}
              >
                <div className="space-y-1">
                  <p className="font-medium">{transaction.name}</p>
                  <div className="text-muted flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant={transaction.direction === "EXPENSE" ? "danger" : "success"}>
                      {transaction.direction === "EXPENSE" ? "Saida" : "Entrada"}
                    </Badge>
                    <span>&middot;</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    transaction.direction === "EXPENSE" ? "text-negative" : "text-positive"
                  }`}
                >
                  {transaction.direction === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(Number(transaction.amount), transaction.isoCurrencyCode ?? "USD")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
