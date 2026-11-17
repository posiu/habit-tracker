import { addDays } from "./entries";

/**
 * Current streak (port of Rails Habits::CalculateStreakService): consecutive completed days
 * ending at the latest completed day. 0 when nothing is completed or the latest completed
 * day is older than yesterday (a streak is still alive until the end of "today").
 */
export function currentStreak(completedDates: Iterable<string>, today: string): number {
  const days = new Set(completedDates);
  if (days.size === 0) return 0;
  const latest = [...days].sort().at(-1)!;
  if (latest < addDays(today, -1)) return 0;

  let streak = 0;
  for (let d = latest; days.has(d); d = addDays(d, -1)) streak++;
  return streak;
}

export function longestStreak(completedDates: Iterable<string>): number {
  const sorted = [...new Set(completedDates)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
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
