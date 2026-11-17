import { AuthForm } from "@/components/auth-form";
import { signup } from "../actions";

export default function SignupPage() {
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
