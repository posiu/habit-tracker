import { connection } from "next/server";
import { Suspense } from "react";
import { GoalForm } from "@/components/goal-form";
import { todayIn } from "@/lib/domain/entries";
import { getTimeZone, listCategories, listHabits } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";

async function Form() {
  await connection();
  const [categories, tz, habits] = await Promise.all([listCategories(), getTimeZone(), listHabits(true)]);
  return <GoalForm categories={categories} habits={habits} defaultStart={todayIn(tz)} />;
}

export default function NewGoalPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="Nowy cel" back={{ href: "/goals", label: "Cele" }} />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}
