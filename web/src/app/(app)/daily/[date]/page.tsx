import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DayForm } from "@/components/day-form";
import { addDays, isValidDate, todayIn } from "@/lib/domain/entries";
import { goalLoggableOn } from "@/lib/domain/goals";
import { getDayEntry, getDayGoalEntries, getTimeZone, listGoalsForDate, listHabitsForDate } from "@/lib/queries";

async function Day({ params }: { params: PageProps<"/daily/[date]">["params"] }) {
  const { date } = await params;
  if (!isValidDate(date)) notFound();

  const today = todayIn(await getTimeZone());
  if (date > today) redirect(`/daily/${today}`);

  const [habits, day, allGoals, goalEntries] = await Promise.all([
    listHabitsForDate(date),
    getDayEntry(date),
    listGoalsForDate(date),
    getDayGoalEntries(date),
  ]);
  const goals = allGoals.filter((g) => goalLoggableOn(g, date));
  return (
    <DayForm
      date={date}
      prevDate={addDays(date, -1)}
      nextDate={date < today ? addDays(date, 1) : null}
      habits={habits}
      day={day}
      goals={goals}
      goalEntries={goalEntries}
    />
  );
}

export default function DayPage(props: PageProps<"/daily/[date]">) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Dzień</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Day params={props.params} />
      </Suspense>
    </main>
  );
}
