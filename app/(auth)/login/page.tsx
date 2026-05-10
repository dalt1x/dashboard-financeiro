import { AuthForm } from "@/components/auth/auth-form";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : "/dashboard";

  return <AuthForm mode="login" redirectTo={redirectTo} />;
}
