import { AuthForm } from "@/components/auth-form";
import { login } from "../actions";

export default function LoginPage() {
  return (
    <AuthForm
      title="Zaloguj się"
      submitLabel="Zaloguj"
      action={login}
      passwordAutoComplete="current-password"
      alt={{ text: "Nie masz konta?", href: "/signup", label: "Zarejestruj się" }}
    />
  );
}
