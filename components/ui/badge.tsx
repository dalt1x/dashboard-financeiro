import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
  {
    variants: {
      variant: {
        default:
          "bg-[color-mix(in_srgb,var(--color-brand)_14%,transparent)] text-[var(--color-brand)] ring-[color-mix(in_srgb,var(--color-brand)_22%,transparent)]",
        secondary:
          "bg-[var(--color-surface-soft)] text-[var(--color-muted)] ring-[var(--color-border)]",
        success:
          "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)] ring-[color-mix(in_srgb,var(--color-success)_22%,transparent)]",
        danger:
          "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[var(--color-danger)] ring-[color-mix(in_srgb,var(--color-danger)_22%,transparent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
