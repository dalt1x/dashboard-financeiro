import Link from "next/link";
import { TransactionDirection } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionCategorySelect } from "@/components/transactions/category-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryOptions, internalCategoryLabels } from "@/lib/constants";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionListSchema } from "@/lib/validators";
import { listTransactions } from "@/server/dashboard-service";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const user = await requireUser();
  const rawSearchParams = await searchParams;
  const params = transactionListSchema.parse(rawSearchParams);
  const result = await listTransactions(user.id, params);
  const baseQuery = new URLSearchParams();

  if (params.query) baseQuery.set("query", params.query);
  if (params.from) baseQuery.set("from", params.from);
  if (params.to) baseQuery.set("to", params.to);
  if (params.category) baseQuery.set("category", params.category);
  if (params.direction) baseQuery.set("direction", params.direction);
  baseQuery.set("pageSize", String(params.pageSize));

  const previousQuery = new URLSearchParams(baseQuery);
  previousQuery.set("page", String(Math.max(1, result.page - 1)));
  const nextQuery = new URLSearchParams(baseQuery);
  nextQuery.set("page", String(Math.min(result.totalPages, result.page + 1)));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transações"
        title="Explorador de transações"
        description="Filtre por periodo, categoria, tipo e termo de busca. A categoria interna pode ser ajustada manualmente por transação."
      />

      <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)]">
        <CardContent className="pt-6">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" method="GET">
            <Input
              defaultValue={params.query}
              name="query"
              placeholder="Buscar por descrição ou merchant"
            />
            <Input defaultValue={params.from} name="from" type="date" />
            <Input defaultValue={params.to} name="to" type="date" />
            <select
              className="h-11 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-strong)] px-4 text-sm"
              defaultValue={params.category ?? "ALL"}
              name="category"
            >
              <option value="ALL">Todas as categorias</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-strong)] px-4 text-sm"
              defaultValue={params.direction ?? "ALL"}
              name="direction"
            >
              <option value="ALL">Todas</option>
              <option value={TransactionDirection.EXPENSE}>Saidas</option>
              <option value={TransactionDirection.INCOME}>Entradas</option>
            </select>
            <Button type="submit" variant="secondary">
              Aplicar filtros
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[var(--color-border)] bg-[var(--color-panel-strong)]">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted py-10 text-center text-sm" colSpan={6}>
                    Nenhuma transação encontrada para os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                result.items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-muted text-xs">
                          {transaction.merchantName ??
                            transaction.categoryDetailed ??
                            "Sem detalhe adicional"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        className="font-medium transition hover:text-[var(--color-brand)]"
                        href={`/accounts/${transaction.accountId}`}
                      >
                        {transaction.account.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TransactionCategorySelect
                        transactionId={transaction.id}
                        value={(transaction.customCategory ??
                          transaction.internalCategory) as string}
                      />
                      <p className="text-muted mt-2 text-xs">
                        Plaid:{" "}
                        <Link
                          className="transition hover:text-[var(--color-brand)]"
                          href={`/categories/${transaction.internalCategory}`}
                        >
                          {internalCategoryLabels[transaction.internalCategory]}
                        </Link>
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.direction === "EXPENSE" ? "danger" : "success"}
                      >
                        {transaction.direction === "EXPENSE" ? "Saida" : "Entrada"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.direction === "EXPENSE"
                          ? "text-negative"
                          : "text-positive"
                      }`}
                    >
                      {transaction.direction === "EXPENSE" ? "-" : "+"}
                      {formatCurrency(
                        Number(transaction.amount),
                        transaction.isoCurrencyCode ?? "USD",
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-muted text-sm">
              Pagina {result.page} de {result.totalPages} • {result.total} transações
            </p>
            <div className="flex gap-2">
              <Button asChild disabled={result.page <= 1} variant="secondary">
                <a href={`?${previousQuery.toString()}`}>Anterior</a>
              </Button>
              <Button asChild disabled={result.page >= result.totalPages} variant="secondary">
                <a href={`?${nextQuery.toString()}`}>Proxima</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
