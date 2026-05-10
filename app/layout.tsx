import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { getThemeBootScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Financeiro",
  description:
    "Aplicacao interativa para consolidacao de contas, transacoes e analises financeiras com Plaid Sandbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--color-app)] text-foreground">
        <Script id="theme-boot" strategy="beforeInteractive">
          {getThemeBootScript()}
        </Script>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
