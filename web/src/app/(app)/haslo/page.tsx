import { SetPasswordForm } from "@/components/set-password-form";
import { PageHeader } from "@/components/page-header";

export default function SetPasswordPage() {
  return (
    <main className="space-y-4">
      <PageHeader title="Ustaw hasło" back={{ href: "/ustawienia", label: "Ustawienia" }} />
      <p className="text-sm text-muted">Hasło musi mieć co najmniej 8 znaków. Po zapisaniu możesz logować się e-mailem i tym hasłem.</p>
      <SetPasswordForm />
    </main>
  );
}
