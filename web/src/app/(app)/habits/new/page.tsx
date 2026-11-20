import { connection } from "next/server";
import { Suspense } from "react";
import { HabitForm } from "@/components/habit-form";
import { today } from "@/lib/domain/habits";
import { listCategories, listHabitGoals, listHabits } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";

async function Form() {
  await connection();
  const [categories, habits, goals] = await Promise.all([listCategories(), listHabits(true), listHabitGoals()]);
  return <HabitForm categories={categories} habits={habits} goals={goals} defaultStart={today()} scheduleDays={[0, 1, 2, 3, 4, 5, 6]} />;
}

export default function NewHabitPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="Nowy nawyk" back={{ href: "/habits", label: "Nawyki" }} />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}
