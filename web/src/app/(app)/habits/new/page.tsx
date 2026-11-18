import { connection } from "next/server";
import { Suspense } from "react";
import { HabitForm } from "@/components/habit-form";
import { today } from "@/lib/domain/habits";
import { listCategories, listHabits } from "@/lib/queries";

async function Form() {
  await connection();
  const [categories, habits] = await Promise.all([listCategories(), listHabits(true)]);
  return <HabitForm categories={categories} habits={habits} defaultStart={today()} scheduleDays={[0, 1, 2, 3, 4, 5, 6]} />;
}

export default function NewHabitPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Nowy nawyk</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}
