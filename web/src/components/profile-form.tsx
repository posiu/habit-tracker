"use client";

import { useActionState } from "react";
import { saveProfile, type SettingsState } from "@/app/(app)/ustawienia/actions";
import { Field, SubmitButton, inputClass } from "./field";

export function ProfileForm({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveProfile, undefined);
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Imię">
          <input name="first_name" maxLength={100} autoComplete="given-name" defaultValue={firstName} className={inputClass} />
        </Field>
        <Field label="Nazwisko">
          <input name="last_name" maxLength={100} autoComplete="family-name" defaultValue={lastName} className={inputClass} />
        </Field>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-ok-text">Zapisano.</p>}
      <div className="flex"><SubmitButton pending={pending}>Zapisz profil</SubmitButton></div>
    </form>
  );
}
