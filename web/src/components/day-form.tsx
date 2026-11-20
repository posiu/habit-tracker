"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { saveDay, type DayState } from "@/app/(app)/daily/actions";
import { MOODS, formatDayPl } from "@/lib/domain/entries";
import { habitTone } from "@/lib/domain/habit-colors";
import type { DayEntry, DayGoal, DayGoalEntry, DayHabit } from "@/lib/queries";
import { Field, SubmitButton, chipClass, inputClass } from "./field";

const HOW = {
  boolean: "Zaznacz, jeśli zrobiony tego dnia",
  numeric: "Wpisz wartość",
  time: "Wpisz czas w minutach",
  count: "Wpisz, ile razy lub sztuk",
} as const;

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
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state) feedback.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [state]);
  const isPast = nextDate !== null;
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
    <form key={sv ? JSON.stringify(sv) : "initial"} action={action} className="max-w-md space-y-6 pb-4 md:max-w-3xl">
      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href={`/daily/${prevDate}`} className="whitespace-nowrap underline" aria-label="Poprzedni dzień">
          ← Wcześniej
        </Link>
        <h2 className="min-w-0 text-center text-xs font-medium capitalize sm:text-sm">{formatDayPl(date)}</h2>
        {nextDate ? (
          <Link href={`/daily/${nextDate}`} className="whitespace-nowrap underline" aria-label="Następny dzień">
            Później →
          </Link>
        ) : (
          <span className="invisible">Później →</span>
        )}
      </div>


      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Nawyki</h3>
          <p className="text-xs text-muted">
            {isPast ? "Uzupełniasz dzień wstecz. " : ""}Przy każdym nawyku widać, co zrobić: zaznaczyć albo wpisać wartość. Puste pole oznacza brak wpisu.
          </p>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-muted">Brak nawyków w tym dniu. Dodaj je w zakładce Nawyki.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {habits.map((h) => {
              const name = `habit_${h.id}`;
              const unit = h.habit_type === "time" ? "min" : h.unit;
              const tone = habitTone(h.color);
              const entry = entryFor(h.id);
              const how = HOW[h.habit_type];
              const target = h.target_value != null ? ` Cel: ${h.target_value}${unit ? ` ${unit}` : ""}.` : "";
              return (
                <li key={h.id} data-testid="day-habit" className="space-y-2 rounded-3xl border p-4" style={{ background: tone.bg, borderColor: tone.border }}>
                  <div className="flex items-center justify-between gap-2">
                    {h.habit_type === "boolean" ? (
                      <span className="text-[15px] font-semibold">{h.name}</span>
                    ) : (
                      <label htmlFor={name} className="text-[15px] font-semibold">{h.name}</label>
                    )}
                    <span aria-hidden="true" className="size-3 flex-none rounded" style={{ background: tone.dot }} />
                  </div>
                  <p id={`${name}_how`} className="text-xs text-soft">
                    {how}.{target}
                  </p>
                  {h.habit_type === "boolean" ? (
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 text-sm font-medium">
                      <input
                        type="checkbox"
                        name={name}
                        aria-label={h.name}
                        className="size-5 accent-accent"
                        defaultChecked={sv ? sv[name] === "on" : (entry?.completed ?? false)}
                      />
                      Zrobione
                    </label>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <input id={name} name={name} inputMode="decimal" aria-describedby={`${name}_how`} defaultValue={defaultFor(h)} className={inputClass} />
                        {unit && <span className="text-sm text-muted">{unit}</span>}
                      </div>
                      {e[name] && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{e[name]}</p>}
                      {!sv && h.target_value != null && entry && (
                        <p className="text-xs text-muted">{entry.completed ? "✓ Cel osiągnięty" : "Poniżej celu"}</p>
                      )}
                    </>
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
                        <select name={`${name}_dir`} defaultValue={dir} aria-label={`Kierunek zmiany: ${g.name}`} className="rounded-2xl border-0 bg-surface-2 px-3 py-3 text-base">
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
                        {g.unit && <span className="text-sm text-muted">{g.unit}</span>}
                      </div>
                      {e[name] && (
                        <span role="alert" className="block text-red-600 dark:text-red-400">
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
                    <span className="text-xs text-muted">{g.goal_type === "days_without" ? "(dzień bez)" : "(dzień z działaniem)"}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">Nastrój</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className={chipClass}>
            <input type="radio" name="mood" value="" className="sr-only" defaultChecked={sv ? !sv.mood : day?.mood == null} />
            Brak
          </label>
          {MOODS.map((m) => (
            <label key={m.value} className={chipClass}>
              <input
                type="radio"
                className="sr-only"
                name="mood"
                value={m.value}
                defaultChecked={sv ? sv.mood === String(m.value) : day?.mood === m.value}
              />
              {m.label}
            </label>
          ))}
        </div>
        {e.mood && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {e.mood}
          </p>
        )}
      </fieldset>

      <Field label="Notatka" error={e.notes}>
        <textarea name="notes" rows={4} defaultValue={sv ? String(sv.notes ?? "") : (day?.notes ?? "")} className={inputClass} />
      </Field>

      {/* feedback sits right above the button, where the eye is after pressing it */}
      <div ref={feedback} className="scroll-mb-40 empty:hidden">
        {e._form && (
          <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {e._form}
          </p>
        )}
        {state?.saved && (
          <p role="status" className="rounded-2xl bg-ok/15 px-4 py-3 text-sm font-semibold text-ok-text">
            Zapisano.
          </p>
        )}
      </div>

      <SubmitButton pending={pending}>Zapisz dzień</SubmitButton>
    </form>
  );
}
