import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { publicSignupAllowed } from "@/lib/admin";
import { signup } from "../actions";

async function Signup() {
  await connection(); // read the env flag at request time, not at build time
  if (!publicSignupAllowed()) redirect("/login");
  return (
    <AuthForm
      title="Załóż konto"
      submitLabel="Zarejestruj"
      action={signup}
      passwordAutoComplete="new-password"
      alt={{ text: "Masz już konto?", href: "/login", label: "Zaloguj się" }}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <Signup />
    </Suspense>
  );
}
