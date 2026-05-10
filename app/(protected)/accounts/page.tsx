import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PlaidConnectButton } from "@/components/plaid/plaid-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { getAccounts } from "@/server/dashboard-service";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await getAccounts(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contas"
        title="Contas conectadas"
        description="Cada conta sincronizada fica vinculada ao usuario autenticado e mostra dados de saldo e instituição do sandbox."
        actions={<PlaidConnectButton />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {accounts.length === 0 ? (
          <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)] lg:col-span-2">
            <CardContent className="text-muted pt-6 text-sm">
              Nenhuma conta conectada ainda. Use o botao acima para iniciar o fluxo da Plaid.
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)]" key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{account.name}</CardTitle>
                    <CardDescription>{account.plaidItem.institutionName ?? "Instituição sandbox"}</CardDescription>
                  </div>
                  <Badge variant="secondary">{account.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="surface-soft rounded-2xl p-4">
                  <p className="data-label">Saldo atual</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(Number(account.currentBalance ?? 0), account.isoCurrencyCode ?? "USD")}</p>
                </div>
                <div className="surface-soft rounded-2xl p-4">
                  <p className="data-label">Saldo disponivel</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(Number(account.availableBalance ?? 0), account.isoCurrencyCode ?? "USD")}</p>
                </div>
                <div className="surface-soft rounded-2xl p-4">
                  <p className="data-label">Subtipo</p>
                  <p className="text-strong mt-2 font-medium">{account.subtype ?? "Nao informado"}</p>
                </div>
                <div className="surface-soft rounded-2xl p-4">
                  <p className="data-label">Mascara</p>
                  <p className="text-strong mt-2 font-medium">{account.mask ?? "Sem mascara"}</p>
                </div>
                <div className="sm:col-span-2">
                  <Button asChild className="w-full" variant="secondary">
                    <Link href={`/accounts/${account.id}`}>Ver detalhes da conta</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
