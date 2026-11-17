import type { HabitType } from "./schemas";

export type EntryValue = {
  completed?: boolean | null;
  boolean_value?: boolean | null;
  numeric_value?: number | null;
  time_value?: number | null;
};

/** Port of Rails Habit#completed_today?: boolean habits use the completed flag, others need a positive value. */
export function isHabitCompleted(type: HabitType, entry: EntryValue | null | undefined): boolean {
  if (!entry) return false;
  switch (type) {
    case "boolean":
      return entry.completed === true;
    case "numeric":
    case "count":
      return (entry.numeric_value ?? 0) > 0;
    case "time":
      return (entry.time_value ?? 0) > 0;
  }
}

export function today(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Archiving ends the habit today. end_date must never precede start_date (DB check constraint). */
export function archivePatch(startDate: string, now: Date = new Date()) {
  const t = today(now);
  return { is_active: false, end_date: t >= startDate ? t : startDate };
}

export function activatePatch() {
  return { is_active: true, end_date: null };
}
