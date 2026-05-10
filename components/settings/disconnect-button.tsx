"use client";

import { useTransition } from "react";
import { Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function DisconnectButton() {
  const [, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const response = await fetch("/api/plaid/disconnect", { method: "POST" });
          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error ?? "Falha ao desconectar.");
            return;
          }

          toast.success("Contas desconectadas.");
          window.location.reload();
        })
      }
      variant="danger"
    >
      <Unplug className="mr-2 h-4 w-4" />
      Desconectar conta
    </Button>
  );
}
