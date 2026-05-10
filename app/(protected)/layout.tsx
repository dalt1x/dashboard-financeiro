import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { getCurrentUser } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <div className="lg:w-80">
          <AppSidebar user={user} />
        </div>
        <main className="flex-1 pb-10 lg:pt-1">{children}</main>
      </div>
    </QueryProvider>
  );
}
