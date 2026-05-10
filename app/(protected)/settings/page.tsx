import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DisconnectButton } from "@/components/settings/disconnect-button";
import { BudgetPlanner } from "@/components/settings/budget-planner";
import { PlaidConnectButton } from "@/components/plaid/plaid-connect-button";
import { SyncButton } from "@/components/settings/sync-button";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categoryOptions } from "@/lib/constants";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { getMonthlyBudgets, getPlaidItems } from "@/server/dashboard-service";

export default async function SettingsPage() {
  const user = await requireUser();
  const [items, budgets] = await Promise.all([
    getPlaidItems(user.id),
    getMonthlyBudgets(user.id),
  ]);

  const budgetMap = new Map(
    budgets.map((budget) => [budget.category, Number(budget.amount)]),
  );

  const initialBudgets = categoryOptions.map((option) => ({
    category: option.value,
    amount: budgetMap.get(option.value) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Integração e ambiente"
        description="Gerencie o status da conexao Plaid, execute sincronizações, ajuste os orçamentos mensais e consulte o setup local."
        actions={
          <>
            <PlaidConnectButton />
            <SyncButton />
            <DisconnectButton />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)]">
          <CardHeader>
            <CardTitle>Status Plaid</CardTitle>
            <CardDescription>
              Itens conectados no sandbox e ultimas sincronizações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-muted text-sm">Nenhum item Plaid conectado.</p>
            ) : (
              items.map((item) => (
                <div className="surface-soft rounded-2xl p-4" key={item.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">
                      {item.institutionName ?? "Sandbox institution"}
                    </Badge>
                    <Badge variant="secondary">{item._count.accounts} contas</Badge>
                    <Badge variant="secondary">
                      {item._count.transactions} transações
                    </Badge>
                  </div>
                  <p className="text-muted mt-3 text-sm">
                    Ultima sincronização:{" "}
                    {item.lastSyncedAt ? formatDate(item.lastSyncedAt) : "Nunca sincronizado"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)]">
          <CardHeader>
            <CardTitle>Setup local</CardTitle>
            <CardDescription>Checklist rapido para rodar o projeto.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted space-y-3 text-sm">
            <p>
              1. Configure o arquivo <code>.env</code> com PostgreSQL, segredos de sessao
              e credenciais da Plaid Sandbox.
            </p>
            <p>
              2. Rode <code>npm run prisma:migrate</code> para aplicar as migrations.
            </p>
            <p>
              3. Se quiser um usuario inicial, rode <code>npm run db:seed</code>.
            </p>
            <p>
              4. Inicie a aplicação com <code>npm run dev</code> e conecte uma conta de
              teste da Plaid.
            </p>
          </CardContent>
        </Card>
      </div>

      <BudgetPlanner
        initialBudgets={initialBudgets}
        monthLabel={format(new Date(), "MMMM yyyy", { locale: ptBR })}
      />
    </div>
  );
}
