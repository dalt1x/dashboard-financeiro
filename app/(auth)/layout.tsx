import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto mb-4 flex max-w-6xl justify-end">
          <ThemeToggle />
        </div>
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-strong)]">
              Integracao real com Plaid Sandbox
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight">
                Portfolio full-stack para dados financeiros, autenticacao e analytics.
              </h1>
              <p className="text-muted max-w-xl text-lg">
                Conecte contas de teste, importe transacoes para PostgreSQL e visualize indicadores, categorias e evolucao de gastos em um painel profissional.
              </p>
            </div>
            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-lg shadow-black/5">
                <p className="data-label">Backend</p>
                <p className="text-strong mt-3 text-2xl font-semibold">Plaid + Prisma</p>
              </div>
              <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-lg shadow-black/5">
                <p className="data-label">Dados</p>
                <p className="text-strong mt-3 text-2xl font-semibold">PostgreSQL</p>
              </div>
              <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-lg shadow-black/5">
                <p className="data-label">Frontend</p>
                <p className="text-strong mt-3 text-2xl font-semibold">Next.js 16</p>
              </div>
            </div>
          </section>
          <div className="flex justify-center lg:justify-end">{children}</div>
        </div>
      </div>
    </QueryProvider>
  );
}
