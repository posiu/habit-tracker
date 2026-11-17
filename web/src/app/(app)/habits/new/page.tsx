import { connection } from "next/server";
import { Suspense } from "react";
import { HabitForm } from "@/components/habit-form";
import { today } from "@/lib/domain/habits";
import { listCategories } from "@/lib/queries";

async function Form() {
  await connection();
  return <HabitForm categories={await listCategories()} defaultStart={today()} />;
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
