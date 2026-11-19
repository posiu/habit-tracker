import Link from "next/link";
import { Suspense } from "react";
import { addDays, isValidDate, todayIn } from "@/lib/domain/entries";
import { isScheduledOn, type Schedule } from "@/lib/domain/schedule";
import { currentStreak } from "@/lib/domain/stats";
import { getTimeZone, listCompletions, listHabits, listSchedules } from "@/lib/queries";

const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

function monthBounds(month: string) {
  const first = `${month}-01`;
  const d = new Date(`${first}T00:00:00Z`);
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  return { first, last: addDays(next, -1), prev: addDays(first, -1).slice(0, 7), next: next.slice(0, 7) };
}

async function Month({ searchParams }: { searchParams: PageProps<"/analiza/miesiac">["searchParams"] }) {
  const { m } = await searchParams;
  const today = todayIn(await getTimeZone());
  const month = typeof m === "string" && /^\d{4}-\d{2}$/.test(m) && isValidDate(`${m}-01`) ? m : today.slice(0, 7);
  const { first, last, prev, next } = monthBounds(month);
  const days = Number(last.slice(8));

  const [active, archived, completions, allSchedules] = await Promise.all([
    listHabits(true),
    listHabits(false),
    listCompletions(),
    listSchedules(),
  ]);
  const habits = [...active, ...archived].filter((h) => h.start_date <= last && (!h.end_date || h.end_date >= first));
  const doneBy = new Map<string, Set<string>>();
  for (const c of completions) doneBy.set(c.habit_id, (doneBy.get(c.habit_id) ?? new Set()).add(c.date));
  const schedBy = new Map<string, Schedule[]>();
  for (const s of allSchedules) schedBy.set(s.habit_id, [...(schedBy.get(s.habit_id) ?? []), s]);

  const rows = habits.map((h) => {
    const done = doneBy.get(h.id) ?? new Set<string>();
    const sched = schedBy.get(h.id) ?? [];
    let due = 0;
    let hit = 0;
    const cells = Array.from({ length: days }, (_, i) => {
      const date = addDays(first, i);
      const inRange = date >= h.start_date && (!h.end_date || date <= h.end_date);
      const scheduled = inRange && isScheduledOn(sched, date);
      const isDone = done.has(date);
      if (date <= today && scheduled) {
        due++;
        if (isDone) hit++;
      }
      const state = date > today || !inRange ? "future" : isDone ? "done" : scheduled ? "missed" : "off";
      return { date, state };
    });
    return {
      habit: h,
      cells,
      pct: due ? Math.round((hit / due) * 100) : null,
      streak: currentStreak(done, today, (d) => isScheduledOn(sched, d)),
    };
  });

  const cellClass = {
    done: "bg-[#8ce563]",
    missed: "bg-white/12",
    off: "border border-dashed border-[#3a3a42]",
    future: "border border-[#2a2a30]",
  } as const;
  const label = { done: "wykonane", missed: "niewykonane", off: "poza harmonogramem", future: "poza zakresem lub w przyszłości" } as const;
  const title = `${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Link href={`/analiza/miesiac?m=${prev}`} aria-label="Poprzedni miesiąc" className="flex size-11 items-center justify-center rounded-full bg-surface-2">‹</Link>
          <Link href={`/analiza/miesiac?m=${next}`} aria-label="Następny miesiąc" className="flex size-11 items-center justify-center rounded-full bg-surface-2">›</Link>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Brak nawyków w tym miesiącu.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-surface p-4">
          <table className="border-separate border-spacing-y-2 text-sm" data-testid="month-grid">
            <thead>
              <tr className="text-[11px] text-muted">
                <th className="sticky left-0 bg-surface pr-3 text-left font-normal">Nawyk</th>
                {Array.from({ length: days }, (_, i) => (
                  <th key={i} className="min-w-5 px-0.5 text-center font-normal">{i + 1}</th>
                ))}
                <th className="pl-3 text-right font-normal">%</th>
                <th className="pl-3 text-right font-normal">seria</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ habit, cells, pct, streak }) => (
                <tr key={habit.id}>
                  <th scope="row" className="sticky left-0 max-w-36 truncate bg-surface pr-3 text-left font-semibold">
                    <Link href={`/habits/${habit.id}`}>{habit.name}</Link>
                  </th>
                  {cells.map((c) => (
                    <td key={c.date} className="px-0.5">
                      <span
                        role="img"
                        aria-label={`${habit.name}, ${c.date}: ${label[c.state as keyof typeof label]}`}
                        className={`block size-5 rounded-md ${cellClass[c.state as keyof typeof cellClass]}`}
                      />
                    </td>
                  ))}
                  <td className="pl-3 text-right text-[#c8c8d0]">{pct === null ? "–" : `${pct}%`}</td>
                  <td className="pl-3 text-right font-semibold">{streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function MonthPage(props: PageProps<"/analiza/miesiac">) {
  return (
    <main className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Analiza</h1>
        <div className="flex gap-1.5 rounded-full bg-surface-2 p-1 text-sm font-semibold">
          <span aria-current="page" className="flex h-9 items-center rounded-full bg-[#e4e4ea] px-4 text-black">Miesiąc</span>
          <Link href="/analiza" className="flex h-9 items-center rounded-full px-4 text-muted">Rok</Link>
        </div>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Month searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
