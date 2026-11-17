import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HabitForm } from "@/components/habit-form";
import { getHabit, listCategories } from "@/lib/queries";

async function Editor({ params }: { params: PageProps<"/habits/[id]/edit">["params"] }) {
  const { id } = await params;
  const [habit, categories] = await Promise.all([getHabit(id), listCategories()]);
  if (!habit) notFound();
  return <HabitForm habit={habit} categories={categories} defaultStart={habit.start_date} />;
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
