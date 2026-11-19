import { SetPasswordForm } from "@/components/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-[34px] font-bold tracking-tight">Ustaw hasło</h1>
      <p className="text-sm text-muted">Hasło musi mieć co najmniej 8 znaków. Po zapisaniu możesz logować się e-mailem i tym hasłem.</p>
      <SetPasswordForm />
    </main>
  );
}
