export type Schedule = { effective_from: string; days: number[] };

/** Day of week, 0 = Sunday ... 6 = Saturday. */
export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** The schedule in force on `date`: the latest one starting on or before it. Undefined = every day. */
export function scheduleOn(schedules: Schedule[], date: string): Schedule | undefined {
  let found: Schedule | undefined;
  for (const s of schedules) {
    if (s.effective_from <= date && (!found || s.effective_from > found.effective_from)) found = s;
  }
  return found;
}

/** Whether the habit is due on `date`. Past days are judged by the schedule that applied then. */
export function isScheduledOn(schedules: Schedule[], date: string): boolean {
  const s = scheduleOn(schedules, date);
  return !s || s.days.length === 0 || s.days.includes(weekday(date));
}

export const WEEKDAYS = [
  [1, "Pn"],
  [2, "Wt"],
  [3, "Śr"],
  [4, "Cz"],
  [5, "Pt"],
  [6, "So"],
  [0, "Nd"],
] as const;

export function sameDays(a: number[], b: number[]): boolean {
  const x = [...new Set(a)].sort();
  const y = [...new Set(b)].sort();
  return x.length === y.length && x.every((d, i) => d === y[i]);
}
