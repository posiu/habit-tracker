"use client";

import { useActionState } from "react";
import { setPassword, type PasswordState } from "@/app/(app)/haslo/actions";
import { SubmitButton, inputClass } from "./field";

export function SetPasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(setPassword, undefined);
  return (
    <form action={action} className="max-w-md space-y-4">
      <label className="block space-y-1.5">
        <span className="block text-xs text-muted">Nowe hasło</span>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="block text-xs text-muted">Powtórz hasło</span>
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex"><SubmitButton pending={pending}>Zapisz hasło</SubmitButton></div>
    </form>
  );
}
