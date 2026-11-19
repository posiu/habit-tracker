import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { addDays, todayIn } from "@/lib/domain/entries";
import { isScheduledOn, weekday, WEEKDAYS } from "@/lib/domain/schedule";
import { identityVotes } from "@/lib/domain/identity";
import { currentStreak, longestStreak } from "@/lib/domain/stats";
import { getHabit, getTimeZone, listCompletions, listIdentityHabits, listSchedules } from "@/lib/queries";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-surface p-4">
      <p className="text-[26px] font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-[15px]">{value}</p>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/habits/[id]">["params"] }) {
  const { id } = await params;
  const habit = await getHabit(id);
  if (!habit) notFound();

  const today = todayIn(await getTimeZone());
  const [completions, schedules, anchor, identityHabits, allCompletions] = await Promise.all([
    listCompletions(id),
    listSchedules([id]),
    habit.anchor_habit_id ? getHabit(habit.anchor_habit_id) : Promise.resolve(null),
    habit.identity ? listIdentityHabits() : Promise.resolve([]),
    habit.identity ? listCompletions() : Promise.resolve([]),
  ]);
  const votes = habit.identity
    ? identityVotes(identityHabits, allCompletions, addDays(today, -29)).find((i) => i.identity.trim().toLocaleLowerCase("pl") === habit.identity!.trim().toLocaleLowerCase("pl"))
    : undefined;
  const done = new Set(completions.map((c) => c.date));
  const scheduled = (d: string) => isScheduledOn(schedules, d);

  // current week, Monday first
  const monday = addDays(today, -((weekday(today) + 6) % 7));
  const week = WEEKDAYS.map(([, label], i) => {
    const date = addDays(monday, i);
    const state: "future" | "done" | "missed" | "off" = date > today ? "future" : done.has(date) ? "done" : scheduled(date) ? "missed" : "off";
    return { label, date, state };
  });
  const circle = {
    done: "bg-ok text-black",
    missed: "bg-surface-2 text-muted",
    off: "border border-dashed border-faint text-faint",
    future: "border border-line text-faint",
  } as const;
  const mark = { done: "✓", missed: "–", off: "", future: "" } as const;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">{habit.name}</h1>
        {habit.identity && <p className="mt-1 text-sm text-muted">Tożsamość: {habit.identity}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="seria teraz" value={currentStreak(done, today, scheduled)} />
        <Stat label="rekord serii" value={longestStreak(done, scheduled)} />
        <Stat label="ukończeń" value={done.size} />
      </div>

      {votes && (
        <section className="rounded-3xl bg-surface p-4" aria-label="Głosy na tożsamość" data-testid="identity-votes">
          <p className="text-xs text-muted">Głosy na tożsamość „{votes.identity}”</p>
          <p className="mt-1 text-[26px] font-bold leading-none">{votes.votes}</p>
          <p className="mt-1.5 text-xs text-muted">
            {votes.recent} w ostatnich 30 dniach{votes.habits.length > 1 ? ` · z ${votes.habits.length} nawyków` : ""}
          </p>
        </section>
      )}

      <section className="rounded-3xl bg-surface p-4" aria-label="Ten tydzień">
        <p className="mb-3 text-xs text-muted">Ten tydzień</p>
        <ul className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
          {week.map((d) => (
            <li key={d.date} className="flex flex-col items-center gap-1.5">
              <span>{d.label}</span>
              <span
                aria-label={`${d.label}: ${{ done: "wykonane", missed: "niewykonane", off: "poza harmonogramem", future: "jeszcze nie" }[d.state]}`}
                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${circle[d.state]}`}
              >
                {mark[d.state]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {(habit.plan_text || anchor || habit.minimum_text) && (
        <section className="space-y-3 rounded-3xl bg-surface p-4">
          {habit.plan_text && <Row label="Kiedy i gdzie" value={habit.plan_text} />}
          {anchor && <Row label="Po tym, jak zrobię" value={anchor.name} />}
          {habit.minimum_text && <Row label="Wersja 2-minutowa" value={habit.minimum_text} />}
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <Link href={`/habits/${habit.id}/edit`} className="flex h-14 flex-1 items-center justify-center rounded-full bg-[#e4e4ea] text-base font-semibold text-chip-text">
          Edytuj
        </Link>
        <Link href="/habits" className="flex h-14 items-center rounded-full bg-surface-2 px-6 text-base font-semibold">
          Wróć
        </Link>
      </div>
    </div>
  );
}

export default function HabitDetailPage(props: PageProps<"/habits/[id]">) {
  return (
    <main>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Detail params={props.params} />
      </Suspense>
    </main>
  );
}
