import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GoalForm } from "@/components/goal-form";
import { getGoal, listCategories, listHabits } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";

async function Editor({ params }: { params: PageProps<"/goals/[id]/edit">["params"] }) {
  const { id } = await params;
  const [goal, categories, habits] = await Promise.all([getGoal(id), listCategories(), listHabits(true)]);
  if (!goal) notFound();
  return <GoalForm goal={goal} categories={categories} habits={habits} defaultStart={goal.start_date} />;
}

export default function EditGoalPage(props: PageProps<"/goals/[id]/edit">) {
  return (
    <main className="space-y-6">
      <PageHeader title="Edytuj cel" back={{ href: "/goals", label: "Cele" }} />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}
