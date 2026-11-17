import { connection } from "next/server";
import { Suspense } from "react";
import { GoalForm } from "@/components/goal-form";
import { todayIn } from "@/lib/domain/entries";
import { getTimeZone, listCategories } from "@/lib/queries";

async function Form() {
  await connection();
  const [categories, tz] = await Promise.all([listCategories(), getTimeZone()]);
  return <GoalForm categories={categories} defaultStart={todayIn(tz)} />;
}

export default function NewGoalPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Nowy cel</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}
