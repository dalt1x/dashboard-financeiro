"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { loginSchema, registerSchema } from "@/lib/validators";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(mode === "register" ? registerSchema : loginSchema),
    defaultValues:
      mode === "register"
        ? { name: "", email: "", password: "" }
        : { email: "", password: "" },
  });

  async function onSubmit(values: Record<string, string>) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao autenticar");
      }

      toast.success(
        mode === "login" ? "Login realizado com sucesso." : "Conta criada com sucesso.",
      );
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel concluir a acao.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-[var(--color-border)] bg-[var(--color-panel-strong)]">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Entrar no dashboard" : "Criar sua conta"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Acesse sua area privada e conecte o Plaid Sandbox."
            : "Cadastre-se para salvar contas, transacoes e categorias por usuario."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register("name")} placeholder="Seu nome" />
              <p className="text-negative text-xs">
                {form.formState.errors.name?.message as string | undefined}
              </p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="voce@exemplo.com"
            />
            <p className="text-negative text-xs">
              {form.formState.errors.email?.message as string | undefined}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="Minimo de 8 caracteres"
            />
            <p className="text-negative text-xs">
              {form.formState.errors.password?.message as string | undefined}
            </p>
          </div>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <p className="text-muted mt-6 text-center text-sm">
          {mode === "login" ? "Ainda nao tem conta?" : "Ja possui conta?"}{" "}
          <Link
            className="font-semibold text-[var(--color-brand)]"
            href={mode === "login" ? "/register" : "/login"}
          >
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
