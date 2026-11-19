import type { ReportHabit } from "@/lib/domain/reports";
import type { Schedule } from "@/lib/domain/schedule";
import { listCompletions, listHabits, listSchedules } from "@/lib/queries";

/** Active and archived habits with their completion days and schedule history, for reports. */
export async function loadReportHabits(): Promise<ReportHabit[]> {
  const [active, archived, completions, schedules] = await Promise.all([
    listHabits(true),
    listHabits(false),
    listCompletions(),
    listSchedules(),
  ]);
  const done = new Map<string, Set<string>>();
  for (const c of completions) done.set(c.habit_id, (done.get(c.habit_id) ?? new Set()).add(c.date));
  const sched = new Map<string, Schedule[]>();
  for (const s of schedules) sched.set(s.habit_id, [...(sched.get(s.habit_id) ?? []), s]);
  return [...active, ...archived].map((h) => ({
    id: h.id,
    name: h.name,
    start_date: h.start_date,
    end_date: h.end_date,
    schedules: sched.get(h.id) ?? [],
    done: done.get(h.id) ?? new Set(),
  }));
}
