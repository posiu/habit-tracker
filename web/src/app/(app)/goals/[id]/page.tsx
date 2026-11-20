import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GoalChart } from "@/components/goal-chart";
import { ProgressSummary, fmt } from "@/components/progress-bar";
import { todayIn } from "@/lib/domain/entries";
import { GOAL_TYPE_LABELS, goalProgress, goalSeries, isHabitGoal, type GoalType } from "@/lib/domain/goals";
import { getGoal, getHabit, getTimeZone, listGoalEntries, loadHabitGoalData, type GoalEntryRow } from "@/lib/queries";
import { BackLink } from "@/components/page-header";

function entryLabel(type: GoalType, e: GoalEntryRow, unit: string | null): string {
  if (type === "target_value") return `${e.is_increment === false ? "−" : "+"}${fmt(e.value ?? 0)}${unit ? ` ${unit}` : ""}`;
  return e.boolean_value ? "Tak" : "Nie";
}

async function Detail({ params }: { params: PageProps<"/goals/[id]">["params"] }) {
  const { id } = await params;
  const goal = await getGoal(id);
  if (!goal) notFound();

  const today = todayIn(await getTimeZone());
  const entries = await listGoalEntries([goal.id]);
  const habitData = await loadHabitGoalData(goal.habit_id ? [goal.habit_id] : []);
  const habit = goal.habit_id ? await getHabit(goal.habit_id) : null;
  const core = {
    goal_type: goal.goal_type,
    start_date: goal.start_date,
    target_date: goal.target_date,
    completed_at: goal.completed_at,
    target_value: goal.goal_metrics?.target_value ?? null,
    days_doing_target: goal.goal_metrics?.days_doing_target ?? null,
    days_without_target: goal.goal_metrics?.days_without_target ?? null,
  };
  const habit_ = goal.habit_id ? habitData.get(goal.habit_id) : undefined;
  const progress = goalProgress(core, entries, today, habit_);
  const series = goalSeries(core, entries, today, habit_);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="space-y-1">
        <BackLink href="/goals" label="Cele" />
        <h1 className="text-[34px] font-bold tracking-tight">{goal.name}</h1>
        <p className="text-sm text-muted">
          {GOAL_TYPE_LABELS[goal.goal_type]} · od {goal.start_date}
          {goal.target_date && ` do ${goal.target_date}`}
          {goal.categories && ` · ${goal.categories.name}`}
        </p>
        {isHabitGoal(goal.goal_type) && (
          <p className="text-sm text-muted">
            Liczony z nawyku:{" "}
            {habit ? (
              <Link href={`/habits/${habit.id}`} className="underline">
                {habit.name}
              </Link>
            ) : (
              (goal.habit_id ? "nawyk został usunięty" : "nie wskazano nawyku")
            )}
          </p>
        )}
      </div>
      <ProgressSummary progress={progress} unit={goal.unit} />
      <GoalChart points={series} target={progress.target} unit={progress.kind === "value" ? goal.unit ?? "" : progress.kind === "days" ? "dni" : ""} />
      <div className="flex gap-4 text-sm">
        <Link href={`/goals/${goal.id}/edit`} className="underline">
          Edytuj
        </Link>
        <Link href="/goals" className="underline">
          Wszystkie cele
        </Link>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Wpisy</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">
            {isHabitGoal(goal.goal_type)
              ? "Postęp liczy się z ukończeń nawyku, ten cel nie ma własnych wpisów."
              : goal.goal_type === "target_date" || goal.goal_type === "custom"
              ? "Ten typ celu nie ma wpisów dziennych."
              : "Brak wpisów. Dodaj je na ekranie dnia."}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sorted.slice(0, 50).map((e) => (
              <li key={e.date} className="flex justify-between py-2">
                <Link href={`/daily/${e.date}`} className="underline">
                  {e.date}
                </Link>
                <span>{entryLabel(goal.goal_type, e, goal.unit)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function GoalPage(props: PageProps<"/goals/[id]">) {
  return (
    <main className="space-y-6">
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Detail params={props.params} />
      </Suspense>
    </main>
  );
}
