import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HabitLogForm } from "@/components/habit-log-form";
import { PageHeader } from "@/components/page-header";
import { formatDayPl, isValidDate, todayIn } from "@/lib/domain/entries";
import { getDayEntry, getTimeZone, listHabitsForDate } from "@/lib/queries";

async function Log({ params, searchParams }: { params: PageProps<"/habits/[id]/log">["params"]; searchParams: PageProps<"/habits/[id]/log">["searchParams"] }) {
  const { id } = await params;
  const { date: requested } = await searchParams;
  const today = todayIn(await getTimeZone());
  const date = typeof requested === "string" && isValidDate(requested) && requested <= today ? requested : today;

  const habit = (await listHabitsForDate(date)).find((h) => h.id === id);
  if (!habit) notFound();
  const day = await getDayEntry(date);
  const current = day?.habit_entries.find((e) => e.habit_id === id) ?? null;
  const back = date === today ? "/" : `/daily/${date}`;

  return (
    <>
      <PageHeader title={habit.name} back={{ href: back, label: date === today ? "Dziś" : "Dzień" }} />
      <p className="-mt-3 text-sm capitalize text-muted">{formatDayPl(date)}</p>
      {habit.minimum_text && <p className="text-sm text-soft">Wersja 2-minutowa: {habit.minimum_text}</p>}
      <HabitLogForm habit={habit} date={date} current={current} back={back} />
    </>
  );
}

export default function HabitLogPage(props: PageProps<"/habits/[id]/log">) {
  return (
    <main className="space-y-4">
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Log params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
