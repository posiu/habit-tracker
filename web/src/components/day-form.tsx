"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveDay, type DayState } from "@/app/(app)/daily/actions";
import { MOODS, formatDayPl } from "@/lib/domain/entries";
import type { DayEntry, DayGoal, DayGoalEntry, DayHabit } from "@/lib/queries";
import { Field, SubmitButton, inputClass } from "./field";

type Props = {
  date: string;
  prevDate: string;
  nextDate: string | null;
  habits: DayHabit[];
  day: DayEntry | null;
  goals: DayGoal[];
  goalEntries: DayGoalEntry[];
};

export function DayForm({ date, prevDate, nextDate, habits, day, goals, goalEntries }: Props) {
  const [state, action, pending] = useActionState<DayState, FormData>(saveDay.bind(null, date), undefined);
  const e = state?.errors ?? {};
  const sv = state?.values;
  const entryFor = (id: string) => day?.habit_entries.find((h) => h.habit_id === id);

  const goalEntryFor = (id: string) => goalEntries.find((g) => g.goal_id === id);

  const defaultFor = (h: DayHabit): string => {
    if (sv) return String(sv[`habit_${h.id}`] ?? "");
    const entry = entryFor(h.id);
    if (!entry) return "";
    if (h.habit_type === "time") return String(entry.time_value ?? "");
    return String(entry.numeric_value ?? "");
  };

  return (
    <form key={sv ? JSON.stringify(sv) : "initial"} action={action} className="max-w-md space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link href={`/daily/${prevDate}`} className="underline" aria-label="Poprzedni dzień">
          ← Wcześniej
        </Link>
        <h2 className="text-center font-medium capitalize">{formatDayPl(date)}</h2>
        {nextDate ? (
          <Link href={`/daily/${nextDate}`} className="underline" aria-label="Następny dzień">
            Później →
          </Link>
        ) : (
          <span className="invisible">Później →</span>
        )}
      </div>

      {e._form && (
        <p role="alert" className="text-sm text-red-600">
          {e._form}
        </p>
      )}
      {state?.saved && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Zapisano.
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Nawyki</h3>
        {habits.length === 0 ? (
          <p className="text-sm text-zinc-500">Brak nawyków w tym dniu. Dodaj je w zakładce Nawyki.</p>
        ) : (
          <ul className="space-y-3">
            {habits.map((h) => {
              const name = `habit_${h.id}`;
              const unit = h.habit_type === "time" ? "min" : h.unit;
              return (
                <li key={h.id}>
                  {h.habit_type === "boolean" ? (
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name={name}
                        defaultChecked={sv ? sv[name] === "on" : (entryFor(h.id)?.completed ?? false)}
                      />
                      {h.name}
                    </label>
                  ) : (
                    <Field label={h.target_value != null ? `${h.name} (cel ${h.target_value}${unit ? ` ${unit}` : ""})` : h.name} error={e[name]}>
                      <div className="flex items-center gap-2">
                        <input name={name} inputMode="decimal" defaultValue={defaultFor(h)} className={inputClass} />
                        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
                      </div>
                      {!sv && h.target_value != null && entryFor(h.id) && (
                        <p className="mt-1 text-xs text-muted">{entryFor(h.id)?.completed ? "✓ Cel osiągnięty" : "Poniżej celu"}</p>
                      )}
                    </Field>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>


      {goals.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Cele</h3>
          <ul className="space-y-3">
            {goals.map((g) => {
              const name = `goal_${g.id}`;
              const entry = goalEntryFor(g.id);
              if (g.goal_type === "target_value") {
                const dir = sv ? String(sv[`${name}_dir`] ?? "inc") : entry?.is_increment === false ? "dec" : "inc";
                return (
                  <li key={g.id}>
                    <div className="space-y-1 text-sm">
                      <label htmlFor={name} className="block font-medium">
                        {g.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <select name={`${name}_dir`} defaultValue={dir} aria-label={`Kierunek zmiany: ${g.name}`} className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700">
                          <option value="inc">+</option>
                          <option value="dec">−</option>
                        </select>
                        <input
                          id={name}
                          name={name}
                          inputMode="decimal"
                          defaultValue={sv ? String(sv[name] ?? "") : String(entry?.value ?? "")}
                          className={inputClass}
                        />
                        {g.unit && <span className="text-sm text-zinc-500">{g.unit}</span>}
                      </div>
                      {e[name] && (
                        <span role="alert" className="block text-red-600">
                          {e[name]}
                        </span>
                      )}
                    </div>
                  </li>
                );
              }
              return (
                <li key={g.id}>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name={name}
                      defaultChecked={sv ? sv[name] === "on" : entry?.boolean_value === true}
                    />
                    {g.name}
                    <span className="text-xs text-zinc-500">{g.goal_type === "days_without" ? "(dzień bez)" : "(dzień z działaniem)"}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Nastrój</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" name="mood" value="" defaultChecked={sv ? !sv.mood : day?.mood == null} />
            Brak
          </label>
          {MOODS.map((m) => (
            <label key={m.value} className="flex items-center gap-1">
              <input
                type="radio"
                name="mood"
                value={m.value}
                defaultChecked={sv ? sv.mood === String(m.value) : day?.mood === m.value}
              />
              {m.label}
            </label>
          ))}
        </div>
        {e.mood && (
          <p role="alert" className="text-sm text-red-600">
            {e.mood}
          </p>
        )}
      </fieldset>

      <Field label="Notatka" error={e.notes}>
        <textarea name="notes" rows={4} defaultValue={sv ? String(sv.notes ?? "") : (day?.notes ?? "")} className={inputClass} />
      </Field>

      <SubmitButton pending={pending}>Zapisz dzień</SubmitButton>
    </form>
  );
}
