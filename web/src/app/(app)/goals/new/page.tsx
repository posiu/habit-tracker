import { connection } from "next/server";
import { Suspense } from "react";
import { GoalForm } from "@/components/goal-form";
import { todayIn } from "@/lib/domain/entries";
import { getTimeZone, listCategories, listHabits } from "@/lib/queries";

async function Form() {
  await connection();
  const [categories, tz, habits] = await Promise.all([listCategories(), getTimeZone(), listHabits(true)]);
  return <GoalForm categories={categories} habits={habits} defaultStart={todayIn(tz)} />;
}

export default function NewGoalPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-[34px] font-bold tracking-tight">Nowy cel</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}
