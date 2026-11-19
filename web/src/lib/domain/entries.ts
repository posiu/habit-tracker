import { z } from "zod";
import type { HabitType } from "./schemas";

export const MOODS = [
  { value: 5, label: "😄 Świetnie" },
  { value: 4, label: "😊 Dobrze" },
  { value: 3, label: "😐 Okej" },
  { value: 2, label: "😔 Słabo" },
  { value: 1, label: "😞 Źle" },
] as const;

export const dailySchema = z.object({
  mood: z.number().int().min(1, "Nastrój od 1 do 5").max(5, "Nastrój od 1 do 5").optional(),
  notes: z.string().trim().max(1000, "Maksymalnie 1000 znaków").optional(),
});

export type HabitEntryValues = {
  completed: boolean;
  boolean_value: boolean | null;
  numeric_value: number | null;
  time_value: number | null;
};

export type HabitEntryResult =
  | { kind: "set"; values: HabitEntryValues }
  | { kind: "clear" }
  | { kind: "error"; message: string };

/**
 * Turns one raw form value into a stored habit entry (port of Rails HabitEntryForm).
 * Boolean habits: checked = completed, unchecked = no entry.
 * Other habits: empty = no entry, otherwise the value must be > 0. It counts as completed when it reaches
 * the habit's target (any positive value when there is no target); below the target the value is
 * stored but not completed. `completed` is stored, so changing the target later never rewrites history.
 */
export function buildHabitEntry(
  type: HabitType,
  raw: string | null | undefined,
  target?: number | null,
): HabitEntryResult {
  if (type === "boolean") {
    return raw === "on"
      ? { kind: "set", values: { completed: true, boolean_value: true, numeric_value: null, time_value: null } }
      : { kind: "clear" };
  }

  const text = (raw ?? "").trim();
  if (text === "") return { kind: "clear" };

  const n = Number(text.replace(",", "."));
  if (!Number.isFinite(n)) return { kind: "error", message: "Podaj liczbę" };
  if (n <= 0) return { kind: "error", message: "Wartość musi być większa od zera" };

  if (type === "time") {
    if (!Number.isInteger(n)) return { kind: "error", message: "Podaj całkowitą liczbę minut" };
    return { kind: "set", values: { completed: reachesTarget(n, target), boolean_value: null, numeric_value: null, time_value: n } };
  }
  return { kind: "set", values: { completed: reachesTarget(n, target), boolean_value: null, numeric_value: n, time_value: null } };
}

export function reachesTarget(value: number, target?: number | null): boolean {
  return target == null ? value > 0 : value >= target;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone; falls back to UTC for an unknown zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** A habit applies on a day when the day is within [start_date, end_date]. */
export function habitActiveOn(habit: { start_date: string; end_date: string | null }, date: string): boolean {
  return habit.start_date <= date && (habit.end_date === null || habit.end_date >= date);
}

export function formatDayPl(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
