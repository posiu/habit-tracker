"use client";

import { useActionState } from "react";
import { inviteUser, type InviteState } from "@/app/(app)/ustawienia/zaproszenia/actions";
import { SubmitButton, inputClass } from "./field";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteUser, undefined);
  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1.5">
        <span className="block text-xs text-muted">Adres e-mail osoby do zaproszenia</span>
        <input name="email" type="email" required autoComplete="off" className={inputClass} />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.message && <p role="status" className="text-sm text-ok-text">{state.message}</p>}
      <div className="flex"><SubmitButton pending={pending}>Wyślij zaproszenie</SubmitButton></div>
    </form>
  );
}
