"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logHabit, type LogState } from "@/app/(app)/habits/[id]/log/actions";
import type { DayHabit } from "@/lib/queries";
import { Field, SubmitButton, inputClass } from "./field";

const HINTS = { numeric: "Wpisz wartość", time: "Ile minut", count: "Ile razy / sztuk", boolean: "" } as const;

export function HabitLogForm({
  habit,
  date,
  current,
  back,
}: {
  habit: DayHabit;
  date: string;
  current: { completed: boolean; numeric_value: number | null; time_value: number | null } | null;
  back: string;
}) {
  const [state, action, pending] = useActionState<LogState, FormData>(logHabit.bind(null, habit.id, date), undefined);
  const unit = habit.habit_type === "time" ? "min" : habit.unit;
  const initial = current ? String(current.time_value ?? current.numeric_value ?? "") : "";
  const value = state?.values ? String(state.values.value ?? "") : initial;

  return (
    <form key={state?.values ? JSON.stringify(state.values) : "initial"} action={action} className="max-w-md space-y-4 md:max-w-lg">
      {state?.errors?._form && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.errors._form}</p>}
      {habit.habit_type === "boolean" ? (
        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 text-base">
          <input type="checkbox" name="value" defaultChecked={state?.values ? state.values.value === "on" : (current?.completed ?? false)} className="size-5 accent-[var(--accent)]" />
          Zrobione
        </label>
      ) : (
        <Field label={HINTS[habit.habit_type]} error={state?.errors?.value}>
          <div className="flex items-center gap-2">
            <input name="value" inputMode="decimal" autoFocus defaultValue={value} placeholder={habit.target_value != null ? `cel: ${habit.target_value}` : "np. 30"} className={inputClass} />
            {unit && <span className="text-sm text-muted">{unit}</span>}
          </div>
        </Field>
      )}
      {habit.target_value != null && habit.habit_type !== "boolean" && (
        <p className="text-sm text-muted">Cel: {habit.target_value}{unit ? ` ${unit}` : ""}. Wpis liczy się jako wykonany, gdy go osiągniesz.</p>
      )}
      {current && habit.habit_type !== "boolean" && <p className="text-sm text-muted">Zostaw pole puste i zapisz, aby usunąć wpis z tego dnia.</p>}
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>Zapisz</SubmitButton>
        <Link href={back} className="text-sm underline">Anuluj</Link>
      </div>
    </form>
  );
}
