"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCategory, type FormState } from "@/app/(app)/categories/actions";
import type { Category } from "@/lib/queries";
import { Field, SubmitButton, inputClass } from "./field";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveCategory.bind(null, category?.id ?? null),
    undefined,
  );
  const e = state?.errors ?? {};
  const v = (key: string, fallback?: string | null) => (state?.values ? String(state.values[key] ?? "") : (fallback ?? ""));

  return (
    <form key={state?.values ? JSON.stringify(state.values) : "initial"} action={action} className="max-w-md space-y-4">
      {e._form && <p role="alert" className="text-sm text-red-600">{e._form}</p>}
      <Field label="Nazwa" error={e.name}>
        <input name="name" required maxLength={100} defaultValue={v("name", category?.name)} className={inputClass} />
      </Field>
      <Field label="Kolor" error={e.color}>
        <input name="color" type="color" defaultValue={v("color", category?.color ?? "#10b981")} className="h-10 w-20 rounded-md border border-zinc-300 dark:border-zinc-700" />
      </Field>
      <Field label="Ikona (np. emoji)" error={e.icon}>
        <input name="icon" maxLength={50} defaultValue={v("icon", category?.icon)} className={inputClass} />
      </Field>
      <Field label="Opis" error={e.description}>
        <textarea name="description" rows={3} defaultValue={v("description", category?.description)} className={inputClass} />
      </Field>
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>Zapisz</SubmitButton>
        <Link href="/categories" className="text-sm underline">Anuluj</Link>
      </div>
    </form>
  );
}
