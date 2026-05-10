import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="panel-tint flex flex-col gap-5 rounded-[30px] border border-[var(--color-border)] px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div className="space-y-4">
        {eyebrow ? <Badge variant="secondary">{eyebrow}</Badge> : null}
        <div className="space-y-2">
          <h1 className="text-strong text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)] lg:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}
