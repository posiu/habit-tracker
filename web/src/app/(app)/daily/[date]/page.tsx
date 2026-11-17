import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DayForm } from "@/components/day-form";
import { addDays, isValidDate, todayIn } from "@/lib/domain/entries";
import { getDayEntry, getTimeZone, listHabitsForDate } from "@/lib/queries";

async function Day({ params }: { params: PageProps<"/daily/[date]">["params"] }) {
  const { date } = await params;
  if (!isValidDate(date)) notFound();

  const today = todayIn(await getTimeZone());
  if (date > today) redirect(`/daily/${today}`);

  const [habits, day] = await Promise.all([listHabitsForDate(date), getDayEntry(date)]);
  return (
    <DayForm
      date={date}
      prevDate={addDays(date, -1)}
      nextDate={date < today ? addDays(date, 1) : null}
      habits={habits}
      day={day}
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
