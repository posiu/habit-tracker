import Link from "next/link";
import { Suspense } from "react";
import { checkIn } from "./actions";
import { Heatmap } from "@/components/heatmap";
import { ProgressSummary } from "@/components/progress-bar";
import { todayIn } from "@/lib/domain/entries";
import { buildHeatmap, currentStreak, heatmapStart, longestStreak } from "@/lib/domain/stats";
import { goalProgress } from "@/lib/domain/goals";
import { isScheduledOn, type Schedule } from "@/lib/domain/schedule";
import { getHeatmapCounts, getTimeZone, listCompletions, listGoalEntries, listGoals, listHabitsForDate, listSchedules, loadHabitGoalData } from "@/lib/queries";

const PALETTE = [1, 2, 3, 4, 5, 6].map((n) => ({ dot: `var(--h${n}-dot)`, bg: `var(--h${n}-bg)`, border: `var(--h${n}-border)` }));

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

async function Dashboard() {
  const today = todayIn(await getTimeZone());
  const [allHabits, completions, counts, goals, allSchedules] = await Promise.all([
    listHabitsForDate(today),
    listCompletions(),
    getHeatmapCounts(heatmapStart(today), today),
    listGoals(false),
    listSchedules(),
  ]);
  const schedulesByHabit = new Map<string, Schedule[]>();
  for (const s of allSchedules) schedulesByHabit.set(s.habit_id, [...(schedulesByHabit.get(s.habit_id) ?? []), s]);
  // Habits that are not due today stay off the dashboard (they can still be logged as a bonus).
  const habits = allHabits.filter((h) => isScheduledOn(schedulesByHabit.get(h.id) ?? [], today));
  const goalEntries = await listGoalEntries(goals.map((g) => g.id));
  const habitData = await loadHabitGoalData(goals.flatMap((g) => (g.habit_id ? [g.habit_id] : [])));
  const goalRows = goals.map((g) => ({
    goal: g,
    progress: goalProgress(
      {
        goal_type: g.goal_type,
        start_date: g.start_date,
        target_date: g.target_date,
        completed_at: g.completed_at,
        target_value: g.goal_metrics?.target_value ?? null,
        days_doing_target: g.goal_metrics?.days_doing_target ?? null,
        days_without_target: g.goal_metrics?.days_without_target ?? null,
      },
      goalEntries.filter((e) => e.goal_id === g.id),
      today,
      g.habit_id ? habitData.get(g.habit_id) : undefined,
    ),
  }));

  const datesByHabit = new Map<string, string[]>();
  for (const c of completions) {
    const list = datesByHabit.get(c.habit_id) ?? [];
    list.push(c.date);
    datesByHabit.set(c.habit_id, list);
  }

  const rows = habits.map((h) => {
    const dates = datesByHabit.get(h.id) ?? [];
    const scheduled = (d: string) => isScheduledOn(schedulesByHabit.get(h.id) ?? [], d);
    return {
      habit: h,
      doneToday: dates.includes(today),
      streak: currentStreak(dates, today, scheduled),
      best: longestStreak(dates, scheduled),
    };
  });

  const doneToday = rows.filter((r) => r.doneToday).length;
  const bestCurrent = Math.max(0, ...rows.map((r) => r.streak));
  const weeks = buildHeatmap(counts, today);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="grid grid-cols-2 gap-3">
        <Tile label="Dziś ukończone" value={`${doneToday}/${habits.length}`} hint="nawyków" />
        <Tile label="Najdłuższa aktualna seria" value={`${bestCurrent}`} hint={bestCurrent === 1 ? "dzień" : "dni"} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Nawyki dziś</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            Brak aktywnych nawyków.{" "}
            <Link href="/habits/new" className="underline">
              Dodaj pierwszy
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {rows.map(({ habit, doneToday: done, streak, best }, i) => {
              const c = PALETTE[i % PALETTE.length];
              return (
                <li
                  key={habit.id}
                  data-testid="habit-row"
                  className="flex flex-col gap-2.5 rounded-3xl border p-3.5"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/habits/${habit.id}`} className="text-[15px] font-semibold leading-tight">{habit.name}</Link>
                    <span aria-hidden="true" className="size-3 flex-none rounded" style={{ background: c.dot }} />
                  </div>
                  <p className="min-h-8 text-xs leading-4 text-soft">
                    seria <strong data-testid="streak">{streak}</strong> · rekord {best}
                  </p>
                  {habit.plan_text && <p className="text-xs leading-4 text-soft">{habit.plan_text}</p>}
                  {habit.habit_type === "boolean" ? (
                    <form action={checkIn.bind(null, habit.id, !done)} className="mt-auto">
                      <button
                        type="submit"
                        aria-label={`${habit.name}: ${done ? "ukończony dziś, kliknij aby cofnąć" : "nieukończony dziś, kliknij aby odhaczyć"}`}
                        className={`h-11 w-full rounded-full text-[15px] font-semibold ${done ? "bg-foreground/15 text-foreground" : "border-[1.5px] bg-transparent text-foreground"}`}
                        style={done ? undefined : { borderColor: c.dot }}
                      >
                        {done ? "✓ Zrobione" : "Odhacz"}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/daily"
                      aria-label={`${habit.name}: ${done ? "ukończony dziś" : "uzupełnij wartość"}`}
                      className={`mt-auto flex h-11 items-center justify-center rounded-full text-[15px] font-semibold ${done ? "bg-foreground/15 text-foreground" : "border-[1.5px] text-foreground"}`}
                      style={done ? undefined : { borderColor: c.dot }}
                    >
                      {done ? "✓ Zrobione" : "Uzupełnij"}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Cele</h2>
        {goalRows.length === 0 ? (
          <p className="text-sm text-muted">
            Brak aktywnych celów.{" "}
            <Link href="/goals/new" className="underline">
              Dodaj pierwszy
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {goalRows.map(({ goal, progress }) => (
              <li key={goal.id} className="space-y-1" data-testid="dash-goal">
                <Link href={`/goals/${goal.id}`} className="text-sm font-medium underline">
                  {goal.name}
                </Link>
                <ProgressSummary progress={progress} unit={goal.unit} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Ostatni rok</h2>
        <p className="text-sm text-muted">
          <span>Aktywności w ostatnim roku</span> <strong className="text-foreground">{total}</strong>
        </p>
        <Heatmap weeks={weeks} total={total} />
      </section>
    </>
  );
}

export default function Home() {
  return (
    <main className="space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Dziś</h1>
        <Link href="/daily" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">
          Uzupełnij dzień
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
