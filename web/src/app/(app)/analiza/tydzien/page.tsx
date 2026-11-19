import Link from "next/link";
import { Suspense } from "react";
import { AnalysisTabs } from "@/components/analysis-tabs";
import { WeekChart } from "@/components/week-chart";
import { addDays, isValidDate, todayIn } from "@/lib/domain/entries";
import { averageMood, periodReport, weekStart } from "@/lib/domain/reports";
import { isScheduledOn } from "@/lib/domain/schedule";
import { currentStreak } from "@/lib/domain/stats";
import { getTimeZone, listDailyEntries, listGoals } from "@/lib/queries";
import { loadReportHabits } from "@/lib/report-data";

const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const fmtDay = (d: string) => `${Number(d.slice(8))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint && <p className="text-xs text-soft">{hint}</p>}
    </div>
  );
}

async function Week({ searchParams }: { searchParams: PageProps<"/analiza/tydzien">["searchParams"] }) {
  const { w } = await searchParams;
  const today = todayIn(await getTimeZone());
  const thisWeek = weekStart(today);
  const from = typeof w === "string" && isValidDate(w) && weekStart(w) <= thisWeek ? weekStart(w) : thisWeek;
  const to = addDays(from, 6);

  const [habits, entries, goals] = await Promise.all([loadReportHabits(), listDailyEntries(from, to), listGoals(false)]);
  const report = periodReport(habits, from, to, today);
  const moods = report.days.map((d) => entries.find((e) => e.entry_date === d.date)?.mood ?? null);
  const avg = averageMood(moods);
  const best = Math.max(0, ...habits.map((h) => currentStreak(h.done, today, (d) => isScheduledOn(h.schedules, d))));

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{fmtDay(from)} – {fmtDay(to)}</h2>
        <div className="flex gap-2">
          <Link href={`/analiza/tydzien?w=${addDays(from, -7)}`} aria-label="Poprzedni tydzień" className="flex size-11 items-center justify-center rounded-full bg-surface-2">‹</Link>
          {from < thisWeek ? (
            <Link href={`/analiza/tydzien?w=${addDays(from, 7)}`} aria-label="Następny tydzień" className="flex size-11 items-center justify-center rounded-full bg-surface-2">›</Link>
          ) : (
            <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-faint">›</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ukończone nawyki" value={report.pct === null ? "–" : `${report.pct}%`} hint={report.due ? `${report.hit} z ${report.due} zaplanowanych` : "brak zaplanowanych"} />
        <Stat label="Najdłuższa seria teraz" value={String(best)} hint={best === 1 ? "dzień" : "dni"} />
        <Stat label="Średni nastrój" value={avg === null ? "–" : avg.toFixed(1).replace(".", ",")} hint={avg === null ? "brak zapisanego nastroju" : "skala 1–5"} />
        <Stat label="Cele w toku" value={String(goals.length)} />
      </div>

      <WeekChart days={report.days} moods={moods} />

      <section aria-label="Nawyki w tygodniu" className="space-y-2">
        <h2 className="text-sm font-semibold">Nawyki</h2>
        {report.perHabit.filter((h) => h.due > 0).length === 0 ? (
          <p className="text-sm text-muted">Brak zaplanowanych nawyków w tym tygodniu.</p>
        ) : (
          <ul className="space-y-2" data-testid="week-habits">
            {report.perHabit.filter((h) => h.due > 0).map((h) => (
              <li key={h.id} className="rounded-3xl bg-surface p-4">
                <div className="flex justify-between text-[15px]">
                  <Link href={`/habits/${h.id}`} className="font-semibold">{h.name}</Link>
                  <span className="text-soft">{h.hit}/{h.due} · {h.pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-ok" style={{ width: `${h.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function WeekPage(props: PageProps<"/analiza/tydzien">) {
  return (
    <main className="space-y-4">
      <AnalysisTabs active="week" />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Week searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
