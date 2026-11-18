"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveHabit, type FormState } from "@/app/(app)/habits/actions";
import { HABIT_TYPES, HABIT_TYPE_LABELS } from "@/lib/domain/schemas";
import type { Category, Habit } from "@/lib/queries";
import { Field, SubmitButton, inputClass } from "./field";

const DAYS = [
  [1, "Pn"],
  [2, "Wt"],
  [3, "Śr"],
  [4, "Cz"],
  [5, "Pt"],
  [6, "So"],
  [0, "Nd"],
] as const;

export function HabitForm({
  habit,
  categories,
  habits,
  defaultStart,
}: {
  habit?: Habit;
  categories: Category[];
  habits: { id: string; name: string }[];
  defaultStart: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveHabit.bind(null, habit?.id ?? null),
    undefined,
  );
  const e = state?.errors ?? {};
  const v = (key: string, fallback?: string | number | null) =>
    state?.values ? String(state.values[key] ?? "") : String(fallback ?? "");
  const days = state?.values ? (state.values.reminder_days as string[] | undefined ?? []).map(Number) : (habit?.reminder_days ?? []);

  return (
    <form key={state?.values ? JSON.stringify(state.values) : "initial"} action={action} className="max-w-md space-y-4">
      {e._form && <p role="alert" className="text-sm text-red-600">{e._form}</p>}
      <Field label="Nazwa" error={e.name}>
        <input name="name" required maxLength={200} defaultValue={v("name", habit?.name)} className={inputClass} />
      </Field>
      <Field label="Typ" error={e.habit_type}>
        <select name="habit_type" defaultValue={v("habit_type", habit?.habit_type ?? "boolean")} className={inputClass}>
          {HABIT_TYPES.map((t) => (
            <option key={t} value={t}>{HABIT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cel" error={e.target_value}>
          <input name="target_value" inputMode="decimal" defaultValue={v("target_value", habit?.target_value)} className={inputClass} />
        </Field>
        <Field label="Jednostka" error={e.unit}>
          <input name="unit" maxLength={50} defaultValue={v("unit", habit?.unit)} className={inputClass} />
        </Field>
      </div>
      <fieldset className="space-y-4 rounded-3xl bg-surface p-4">
        <legend className="px-1 text-sm font-semibold">Plan (Atomic Habits)</legend>
        <Field label="Kim się staję (tożsamość)" error={e.identity}>
          <input name="identity" maxLength={200} placeholder="np. Jestem czytelnikiem" defaultValue={v("identity", habit?.identity)} className={inputClass} />
        </Field>
        <Field label="Kiedy i gdzie to zrobię" error={e.plan_text}>
          <input name="plan_text" maxLength={300} placeholder="np. o 21:00 w fotelu przy oknie" defaultValue={v("plan_text", habit?.plan_text)} className={inputClass} />
        </Field>
        <Field label="Po tym, jak zrobię (nawyk)" error={e.anchor_habit_id}>
          <select name="anchor_habit_id" defaultValue={v("anchor_habit_id", habit?.anchor_habit_id)} className={inputClass}>
            <option value="">Bez powiązania</option>
            {habits.filter((h) => h.id !== habit?.id).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Wersja 2-minutowa" error={e.minimum_text}>
          <input name="minimum_text" maxLength={200} placeholder="np. przeczytać jedną stronę" defaultValue={v("minimum_text", habit?.minimum_text)} className={inputClass} />
        </Field>
      </fieldset>
      <Field label="Kategoria" error={e.category_id}>
        <select name="category_id" defaultValue={v("category_id", habit?.category_id)} className={inputClass}>
          <option value="">Bez kategorii</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start" error={e.start_date}>
          <input name="start_date" type="date" required defaultValue={v("start_date", habit?.start_date ?? defaultStart)} className={inputClass} />
        </Field>
        <Field label="Koniec (opcjonalnie)" error={e.end_date}>
          <input name="end_date" type="date" defaultValue={v("end_date", habit?.end_date)} className={inputClass} />
        </Field>
      </div>
      <fieldset className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input name="reminder_enabled" type="checkbox" defaultChecked={state?.values ? state.values.reminder_enabled === "on" : habit?.reminder_enabled} />
          Przypomnienia
        </label>
        <div className="flex flex-wrap gap-3">
          {DAYS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-1">
              <input name="reminder_days" type="checkbox" value={value} defaultChecked={days.includes(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>Zapisz</SubmitButton>
        <Link href="/habits" className="text-sm underline">Anuluj</Link>
      </div>
    </form>
  );
}
