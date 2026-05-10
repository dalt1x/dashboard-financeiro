"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlugZap } from "lucide-react";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function PlaidConnectButton() {
  const queryClient = useQueryClient();

  const tokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel criar o link token.");
      }

      return data.linkToken as string;
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel conectar a conta.");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Conta sandbox conectada com sucesso.");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao conectar conta.");
    },
  });

  const { open, ready } = usePlaidLink({
    token: tokenMutation.data ?? null,
    onSuccess: (publicToken) => {
      exchangeMutation.mutate(publicToken);
    },
  });

  useEffect(() => {
    if (tokenMutation.data && ready) {
      open();
    }
  }, [open, ready, tokenMutation.data]);

  async function handleConnect() {
    if (tokenMutation.data && ready) {
      open();
      return;
    }

    if (!tokenMutation.isPending) {
      await tokenMutation.mutateAsync();
    }
  }

  return (
    <Button
      disabled={
        tokenMutation.isPending || exchangeMutation.isPending || (!ready && Boolean(tokenMutation.data))
      }
      onClick={handleConnect}
    >
      {tokenMutation.isPending || exchangeMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlugZap className="mr-2 h-4 w-4" />
      )}
      Conectar conta sandbox
    </Button>
  );
}
