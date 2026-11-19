import { addDays } from "./entries";

export type ScheduledOn = (date: string) => boolean;
const always: ScheduledOn = () => true;

/**
 * Current streak: consecutive scheduled days completed, counted back from today. A scheduled
 * day that is not done yet does not break it (it is alive until the end of "today"). Days
 * outside the schedule are skipped, and a bonus entry on such a day neither extends nor breaks it.
 */
export function currentStreak(completedDates: Iterable<string>, today: string, scheduled: ScheduledOn = always): number {
  const done = new Set(completedDates);
  if (done.size === 0) return 0;
  const earliest = [...done].sort()[0];

  let d = today;
  if (scheduled(d) && !done.has(d)) d = addDays(d, -1);
  let streak = 0;
  while (d >= earliest) {
    if (scheduled(d)) {
      if (!done.has(d)) break;
      streak++;
    }
    d = addDays(d, -1);
  }
  return streak;
}

export function longestStreak(completedDates: Iterable<string>, scheduled: ScheduledOn = always): number {
  const done = new Set(completedDates);
  if (done.size === 0) return 0;
  const sorted = [...done].sort();
  const last = sorted.at(-1)!;
  let best = 0;
  let run = 0;
  for (let d = sorted[0]; d <= last; d = addDays(d, 1)) {
    if (!scheduled(d)) continue;
    run = done.has(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** Heatmap intensity from the number of completions in a day (same buckets as Rails). */
export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export type HeatCell = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 } | null;

/** Day of week with Monday = 0. */
function mondayIndex(date: string): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

/**
 * Builds a GitHub-style grid: columns are weeks (Monday first), rows are weekdays.
 * Covers the 52 weeks up to and including `today`; cells after today are null.
 */
export function buildHeatmap(counts: Record<string, number>, today: string, weeks = 53): HeatCell[][] {
  const lastMonday = addDays(today, -mondayIndex(today));
  const firstMonday = addDays(lastMonday, -7 * (weeks - 1));

  const columns: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(firstMonday, w * 7 + d);
      if (date > today) column.push(null);
      else {
        const count = counts[date] ?? 0;
        column.push({ date, count, level: heatLevel(count) });
      }
    }
    columns.push(column);
  }
  return columns;
}

export function heatmapStart(today: string, weeks = 53): string {
  return addDays(addDays(today, -mondayIndex(today)), -7 * (weeks - 1));
}
