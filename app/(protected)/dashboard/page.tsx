import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { ComparisonCard } from "@/components/dashboard/comparison-card";
import { PlaidConnectButton } from "@/components/plaid/plaid-connect-button";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSummary, getPlaidItems, getRecentTransactions } from "@/server/dashboard-service";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const [summary, recentTransactions, plaidItems] = await Promise.all([
    getDashboardSummary(user.id),
    getRecentTransactions(user.id),
    getPlaidItems(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visao geral"
        title="Seu comando financeiro"
        description="Monitore o saldo consolidado, acompanhe categorias e valide a integracao completa entre frontend, backend, PostgreSQL e Plaid Sandbox."
        actions={<PlaidConnectButton />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard metric="balance" title="Saldo total das contas" description="Soma dos saldos atuais" value={summary.totalBalance} />
        <MetricCard metric="expense" title="Despesas do mes" description="Saidas no mes atual" value={summary.totalSpentMonth} />
        <MetricCard metric="income" title="Receitas do mes" description="Entradas no mes atual" value={summary.totalIncomeMonth} />
        <MetricCard metric="balance" title="Transacoes persistidas" description="Total de lancamentos" value={summary.totalTransactions} />
      </div>

      <Card className="panel-tint border-[var(--color-border)]">
        <CardContent className="grid gap-5 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-muted text-sm">Status da integracao</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={plaidItems.length > 0 ? "success" : "secondary"}>
                {plaidItems.length > 0 ? `${plaidItems.length} item(ns) conectados` : "Nenhuma conta conectada"}
              </Badge>
              {summary.latestSyncAt ? <Badge variant="secondary">Ultima sync em {formatDate(summary.latestSyncAt)}</Badge> : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-soft rounded-2xl px-4 py-4">
              <p className="data-label">Itens</p>
              <p className="text-strong mt-2 text-2xl font-semibold">{plaidItems.length}</p>
            </div>
            <div className="surface-soft rounded-2xl px-4 py-4">
              <p className="data-label">Contas</p>
              <p className="text-strong mt-2 text-2xl font-semibold">
                {plaidItems.reduce((sum, item) => sum + item._count.accounts, 0)}
              </p>
            </div>
            <div className="surface-soft rounded-2xl px-4 py-4">
              <p className="data-label">Lançamentos</p>
              <p className="text-strong mt-2 text-2xl font-semibold">
                {plaidItems.reduce((sum, item) => sum + item._count.transactions, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ComparisonCard comparison={summary.comparison} />
        <BudgetProgressCard
          budgets={summary.budgets}
          remaining={summary.remainingBudgetMonth}
          totalBudgeted={summary.totalBudgetedMonth}
        />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TrendChart data={summary.monthlyTrend} />
        <CategoryChart data={summary.byCategory} />
      </div>

      <RecentTransactions transactions={recentTransactions as never} />
    </div>
  );
}
