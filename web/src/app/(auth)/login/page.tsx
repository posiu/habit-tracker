import { connection } from "next/server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { publicSignupAllowed } from "@/lib/admin";
import { login } from "../actions";

async function Login() {
  await connection(); // read the env flag at request time, not at build time
  return (
    <AuthForm
      title="Zaloguj się"
      submitLabel="Zaloguj"
      action={login}
      passwordAutoComplete="current-password"
      alt={publicSignupAllowed() ? { text: "Nie masz konta?", href: "/signup", label: "Zarejestruj się" } : undefined}
      extra={{ href: "/reset", label: "Nie pamiętasz hasła?" }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
