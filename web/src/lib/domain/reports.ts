import { addDays } from "./entries";
import { isScheduledOn, weekday, type Schedule } from "./schedule";

export type ReportHabit = {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  schedules: Schedule[];
  done: Set<string>;
};

/** Whether the habit was due on `date`: active that day and scheduled by the schedule of that day. */
export function habitDue(h: Pick<ReportHabit, "start_date" | "end_date" | "schedules">, date: string): boolean {
  return date >= h.start_date && (!h.end_date || date <= h.end_date) && isScheduledOn(h.schedules, date);
}

export type DayReport = { date: string; due: number; hit: number; pct: number | null };
export type PeriodReport = {
  days: DayReport[];
  due: number;
  hit: number;
  pct: number | null;
  perHabit: { id: string; name: string; due: number; hit: number; pct: number | null }[];
};

const pctOf = (hit: number, due: number) => (due === 0 ? null : Math.round((hit / due) * 100));

/** Completion over [from, to]. Days after `today` are not due yet; bonus entries off-schedule are not counted. */
export function periodReport(habits: ReportHabit[], from: string, to: string, today: string): PeriodReport {
  const perHabit = habits.map((h) => ({ id: h.id, name: h.name, due: 0, hit: 0, pct: null as number | null }));
  const days: DayReport[] = [];
  let due = 0;
  let hit = 0;
  for (let date = from; date <= to; date = addDays(date, 1)) {
    let dayDue = 0;
    let dayHit = 0;
    if (date <= today) {
      habits.forEach((h, i) => {
        if (!habitDue(h, date)) return;
        dayDue++;
        perHabit[i].due++;
        if (h.done.has(date)) {
          dayHit++;
          perHabit[i].hit++;
        }
      });
    }
    days.push({ date, due: dayDue, hit: dayHit, pct: pctOf(dayHit, dayDue) });
    due += dayDue;
    hit += dayHit;
  }
  for (const p of perHabit) p.pct = pctOf(p.hit, p.due);
  return { days, due, hit, pct: pctOf(hit, due), perHabit };
}

/** Monday of the week containing `date`. */
export function weekStart(date: string): string {
  return addDays(date, -((weekday(date) + 6) % 7));
}

export function averageMood(moods: (number | null)[]): number | null {
  const m = moods.filter((x): x is number => x != null);
  return m.length === 0 ? null : m.reduce((a, b) => a + b, 0) / m.length;
}

// ---- CSV export ------------------------------------------------------------

/** Quotes a CSV field; values that a spreadsheet would run as a formula get a leading apostrophe. */
export function csvField(value: string | number | boolean | null | undefined): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  return [header, ...rows].map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}
