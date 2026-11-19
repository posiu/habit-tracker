import Link from "next/link";
import { Suspense } from "react";
import { completeGoal, deleteGoal, reopenGoal } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { ProgressSummary } from "@/components/progress-bar";
import { todayIn } from "@/lib/domain/entries";
import { GOAL_TYPE_LABELS, goalDaysRemaining, goalProgress } from "@/lib/domain/goals";
import { getTimeZone, listGoalEntries, listGoals } from "@/lib/queries";

async function GoalList({ searchParams }: { searchParams: PageProps<"/goals">["searchParams"] }) {
  const { view } = await searchParams;
  const closed = view === "closed";
  const today = todayIn(await getTimeZone());
  const goals = await listGoals(closed);
  const entries = await listGoalEntries(goals.map((g) => g.id));

  return (
    <>
      <div className="flex gap-4 text-sm">
        <Link href="/goals" className={closed ? "text-muted" : "font-semibold underline"}>
          Aktywne
        </Link>
        <Link href="/goals?view=closed" className={closed ? "font-semibold underline" : "text-muted"}>
          Zamknięte
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-muted">{closed ? "Brak zamkniętych celów." : "Brak celów. Dodaj pierwszy."}</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => {
            const progress = goalProgress(
              {
                goal_type: g.goal_type,
                start_date: g.start_date,
                target_date: g.target_date,
                completed_at: g.completed_at,
                target_value: g.goal_metrics?.target_value ?? null,
                days_doing_target: g.goal_metrics?.days_doing_target ?? null,
                days_without_target: g.goal_metrics?.days_without_target ?? null,
              },
              entries.filter((e) => e.goal_id === g.id),
              today,
            );
            const left = goalDaysRemaining(g, today);
            return (
              <li key={g.id} className="space-y-2 rounded-3xl bg-surface p-4" data-testid="goal-card">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <Link href={`/goals/${g.id}`} className="font-medium underline">
                    {g.name}
                  </Link>
                  <span className="text-xs text-muted">
                    {GOAL_TYPE_LABELS[g.goal_type]}
                    {g.categories && ` · ${g.categories.name}`}
                    {left !== null && !g.completed_at && ` · ${left >= 0 ? `zostało ${left} dni` : `${-left} dni po terminie`}`}
                  </span>
                </div>
                <ProgressSummary progress={progress} unit={g.unit} />
                <div className="flex items-center gap-4 text-sm">
                  <Link href={`/goals/${g.id}/edit`} className="underline">
                    Edytuj
                  </Link>
                  {closed ? (
                    <form action={reopenGoal.bind(null, g.id)}>
                      <button type="submit" className="underline">
                        Wznów
                      </button>
                    </form>
                  ) : (
                    <form action={completeGoal.bind(null, g.id)}>
                      <button type="submit" className="underline">
                        Zamknij cel
                      </button>
                    </form>
                  )}
                  <DeleteButton
                    action={deleteGoal.bind(null, g.id)}
                    confirmText={`Usunąć cel „${g.name}” razem z jego wpisami? Tej operacji nie można cofnąć.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function GoalsPage(props: PageProps<"/goals">) {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Cele</h1>
        <Link href="/goals/new" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">
          Nowy cel
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <GoalList searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
