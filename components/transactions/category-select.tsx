"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { categoryOptions } from "@/lib/constants";

export function TransactionCategorySelect({
  transactionId,
  value,
}: {
  transactionId: string;
  value: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={value}
      disabled={isPending}
      onValueChange={(category) =>
        startTransition(async () => {
          const response = await fetch("/api/transactions/update-category", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactionId,
              category,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error ?? "Falha ao atualizar categoria.");
            return;
          }

          toast.success("Categoria atualizada.");
          router.refresh();
        })
      }
    >
      <SelectTrigger className="surface-soft h-9 min-w-[170px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categoryOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
