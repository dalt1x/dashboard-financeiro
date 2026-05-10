"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function SyncButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const response = await fetch("/api/plaid/sync", { method: "POST" });
          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error ?? "Falha ao sincronizar.");
            return;
          }

          toast.success("Sincronizacao concluida.");
          window.location.reload();
        })
      }
      variant="secondary"
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      Atualizar transacoes
    </Button>
  );
}
