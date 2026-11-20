"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveGoal, type FormState } from "@/app/(app)/goals/actions";
import { GOAL_TYPES, GOAL_TYPE_HINTS, GOAL_TYPE_LABELS, isHabitGoal, type GoalType } from "@/lib/domain/goals";
import type { Category, Goal } from "@/lib/queries";
import { Field, SubmitButton, inputClass } from "./field";

export function GoalForm({
  goal,
  categories,
  habits,
  defaultStart,
}: {
  goal?: Goal;
  categories: Category[];
  habits: { id: string; name: string }[];
  defaultStart: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveGoal.bind(null, goal?.id ?? null), undefined);
  const e = state?.errors ?? {};
  const sv = state?.values;
  const v = (key: string, fallback?: string | number | null) => (sv ? String(sv[key] ?? "") : String(fallback ?? ""));

  const initialType = (sv ? v("goal_type") : (goal?.goal_type ?? "target_value")) as GoalType;
  const [type, setType] = useState<GoalType>(initialType);
  const m = goal?.goal_metrics;
  const daysTarget = goal?.goal_type === "days_doing" || (goal && isHabitGoal(goal.goal_type)) ? m?.days_doing_target : goal?.goal_type === "days_without" ? m?.days_without_target : null;

  return (
    <form key={sv ? JSON.stringify(sv) : "initial"} action={action} className="grid max-w-md gap-4 md:max-w-3xl md:grid-cols-2 md:items-start md:gap-x-6">
      {e._form && (
        <p role="alert" className="md:col-span-2 text-sm text-red-600 dark:text-red-400">
          {e._form}
        </p>
      )}
      <Field label="Nazwa" error={e.name}>
        <input name="name" placeholder="np. Odłożyć na wakacje" required maxLength={200} defaultValue={v("name", goal?.name)} className={inputClass} />
      </Field>
      <Field label="Typ celu" error={e.goal_type}>
        <select name="goal_type" value={type} onChange={(ev) => setType(ev.target.value as GoalType)} className={inputClass}>
          {GOAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {GOAL_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>
      <p className="text-xs text-muted md:col-span-2 md:-mt-2">{GOAL_TYPE_HINTS[type]}</p>

      {type === "target_value" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Wartość docelowa" error={e.target_value}>
            <input name="target_value" placeholder="np. 5000" inputMode="decimal" defaultValue={v("target_value", m?.target_value)} className={inputClass} />
          </Field>
          <Field label="Jednostka" error={e.unit}>
            <input name="unit" placeholder="np. zł, km, kg" maxLength={50} defaultValue={v("unit", goal?.unit)} className={inputClass} />
          </Field>
        </div>
      )}
      {isHabitGoal(type) && (
        <Field label="Nawyk" error={e.habit_id}>
          <select name="habit_id" defaultValue={v("habit_id", goal?.habit_id)} className={inputClass}>
            <option value="">Wybierz nawyk</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </Field>
      )}
      {(type === "days_doing" || type === "days_without" || isHabitGoal(type)) && (
        <Field label={isHabitGoal(type) ? (type === "habit_streak" ? "Docelowa długość serii (dni)" : "Liczba ukończonych dni") : "Liczba dni do osiągnięcia (puste = do terminu albo 30)"} error={e.days_target}>
          <input name="days_target" inputMode="numeric" defaultValue={v("days_target", daysTarget)} className={inputClass} />
        </Field>
      )}

      <Field label="Kategoria" error={e.category_id}>
        <select name="category_id" defaultValue={v("category_id", goal?.category_id)} className={inputClass}>
          <option value="">Bez kategorii</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start" error={e.start_date}>
          <input name="start_date" type="date" required defaultValue={v("start_date", goal?.start_date ?? defaultStart)} className={inputClass} />
        </Field>
        <Field label={type === "target_date" ? "Termin" : "Termin (opcjonalnie)"} error={e.target_date}>
          <input name="target_date" type="date" required={type === "target_date"} defaultValue={v("target_date", goal?.target_date)} className={inputClass} />
        </Field>
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <SubmitButton pending={pending}>Zapisz</SubmitButton>
        <Link href="/goals" className="text-sm underline">
          Anuluj
        </Link>
      </div>
    </form>
  );
}
