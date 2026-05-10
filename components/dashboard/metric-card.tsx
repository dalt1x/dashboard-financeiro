import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const iconByMetric = {
  balance: Wallet,
  expense: ArrowUpRight,
  income: ArrowDownLeft,
};

const accentByMetric = {
  balance: "from-fuchsia-500/15 to-violet-500/5 text-fuchsia-700",
  expense: "from-rose-500/15 to-orange-500/5 text-rose-700",
  income: "from-emerald-500/15 to-lime-500/5 text-emerald-700",
};

export function MetricCard({
  metric,
  title,
  description,
  value,
}: {
  metric: keyof typeof iconByMetric;
  title: string;
  description: string;
  value: number;
}) {
  const Icon = iconByMetric[metric];

  return (
    <Card className="panel-tint overflow-hidden border-[var(--color-border)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardDescription>{description}</CardDescription>
          <CardTitle className="text-strong mt-2 text-3xl">{formatCurrency(value)}</CardTitle>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentByMetric[metric]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-strong text-sm font-medium">{title}</p>
      </CardContent>
    </Card>
  );
}
