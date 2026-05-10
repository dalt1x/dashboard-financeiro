"use client";

import { CreditCard, LayoutDashboard, Link2, LogOut, Receipt, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacoes", icon: Receipt },
  { href: "/accounts", label: "Contas", icon: CreditCard },
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

export function AppSidebar({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="surface-strong app-shell flex w-full flex-col rounded-[28px] border border-[var(--color-border)] p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-xs">
      <div className="sidebar-gradient rounded-[22px] p-5 text-white">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-teal-50/80">Plaid Sandbox</p>
            <h1 className="text-lg font-semibold">Dashboard de Financas</h1>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-sm text-teal-50/80">{user.email}</p>
        </div>
      </div>

      <nav className="mt-5 grid grid-cols-2 gap-2 lg:flex lg:flex-1 lg:flex-col lg:space-y-1 lg:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                isActive &&
                  "nav-link-active hover:bg-[var(--color-nav-active-bg)] hover:text-[var(--color-nav-active-text)]",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 grid gap-2">
        <ThemeToggle className="w-full justify-start" />
        <Button className="w-full justify-start" onClick={handleLogout} variant="secondary">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
