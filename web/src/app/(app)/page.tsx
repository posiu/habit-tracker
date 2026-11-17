import Link from "next/link";
import { Suspense } from "react";
import { Heatmap } from "@/components/heatmap";
import { todayIn } from "@/lib/domain/entries";
import { buildHeatmap, currentStreak, heatmapStart, longestStreak } from "@/lib/domain/stats";
import { getHeatmapCounts, getTimeZone, listCompletions, listHabitsForDate } from "@/lib/queries";

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

async function Dashboard() {
  const today = todayIn(await getTimeZone());
  const [habits, completions, counts] = await Promise.all([
    listHabitsForDate(today),
    listCompletions(),
    getHeatmapCounts(heatmapStart(today), today),
  ]);

  const datesByHabit = new Map<string, string[]>();
  for (const c of completions) {
    const list = datesByHabit.get(c.habit_id) ?? [];
    list.push(c.date);
    datesByHabit.set(c.habit_id, list);
  }

  const rows = habits.map((h) => {
    const dates = datesByHabit.get(h.id) ?? [];
    return {
      habit: h,
      doneToday: dates.includes(today),
      streak: currentStreak(dates, today),
      best: longestStreak(dates),
    };
  });

  const doneToday = rows.filter((r) => r.doneToday).length;
  const bestCurrent = Math.max(0, ...rows.map((r) => r.streak));
  const weeks = buildHeatmap(counts, today);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Dziś ukończone" value={`${doneToday}/${habits.length}`} hint="nawyków" />
        <Tile label="Najdłuższa aktualna seria" value={`${bestCurrent}`} hint={bestCurrent === 1 ? "dzień" : "dni"} />
        <Tile label="Aktywności w ostatnim roku" value={`${total}`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Nawyki dziś</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Brak aktywnych nawyków.{" "}
            <Link href="/habits/new" className="underline">
              Dodaj pierwszy
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map(({ habit, doneToday: done, streak, best }) => (
              <li key={habit.id} className="flex items-center gap-3 py-2 text-sm" data-testid="habit-row">
                <span aria-label={done ? "ukończony dziś" : "nieukończony dziś"}>{done ? "✅" : "⬜"}</span>
                <span className="font-medium">{habit.name}</span>
                <span className="ml-auto text-zinc-500">
                  seria <strong data-testid="streak">{streak}</strong> · rekord {best}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Ostatni rok</h2>
        <Heatmap weeks={weeks} total={total} />
      </section>
    </>
  );
}

export default function Home() {
  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pulpit</h1>
        <Link href="/daily" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          Uzupełnij dzień
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
