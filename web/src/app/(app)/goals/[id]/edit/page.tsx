import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GoalForm } from "@/components/goal-form";
import { getGoal, listCategories } from "@/lib/queries";

async function Editor({ params }: { params: PageProps<"/goals/[id]/edit">["params"] }) {
  const { id } = await params;
  const [goal, categories] = await Promise.all([getGoal(id), listCategories()]);
  if (!goal) notFound();
  return <GoalForm goal={goal} categories={categories} defaultStart={goal.start_date} />;
}

export default function EditGoalPage(props: PageProps<"/goals/[id]/edit">) {
  return (
    <main className="space-y-6">
      <h1 className="text-[34px] font-bold tracking-tight">Edytuj cel</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}
