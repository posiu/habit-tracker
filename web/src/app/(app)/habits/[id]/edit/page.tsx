import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HabitForm } from "@/components/habit-form";
import { todayIn } from "@/lib/domain/entries";
import { scheduleOn } from "@/lib/domain/schedule";
import { getHabit, getTimeZone, listCategories, listHabits, listSchedules } from "@/lib/queries";

async function Editor({ params }: { params: PageProps<"/habits/[id]/edit">["params"] }) {
  const { id } = await params;
  const [habit, categories, habits] = await Promise.all([getHabit(id), listCategories(), listHabits(true)]);
  if (!habit) notFound();
  const schedules = await listSchedules([habit.id]);
  const current = scheduleOn(schedules, todayIn(await getTimeZone()));
  return (
    <HabitForm
      habit={habit}
      categories={categories}
      habits={habits}
      defaultStart={habit.start_date}
      scheduleDays={current?.days ?? [0, 1, 2, 3, 4, 5, 6]}
    />
  );
}

export default function EditHabitPage(props: PageProps<"/habits/[id]/edit">) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Edytuj nawyk</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}
