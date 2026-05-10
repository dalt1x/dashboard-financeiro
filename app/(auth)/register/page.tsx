import { AuthForm } from "@/components/auth/auth-form";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : "/dashboard";

  return <AuthForm mode="register" redirectTo={redirectTo} />;
}
