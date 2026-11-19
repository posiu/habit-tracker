import { GOAL_STATUS_LABELS, type GoalProgress } from "@/lib/domain/goals";

const STATUS_CLASS: Record<GoalProgress["status"], string> = {
  not_started: "text-muted",
  in_progress: "text-blue-700 dark:text-blue-400",
  reached: "text-emerald-700 dark:text-emerald-400",
  overdue: "text-red-700 dark:text-red-600 dark:text-red-400",
  completed: "text-muted",
};

export function fmt(n: number): string {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(n);
}

export function ProgressSummary({ progress, unit }: { progress: GoalProgress; unit: string | null }) {
  const { percentage, current, target, kind, status } = progress;
  const amount =
    kind === "days"
      ? `${fmt(current)} / ${fmt(target ?? 0)} dni`
      : kind === "time"
        ? `${fmt(current)} / ${fmt(target ?? 0)} dni terminu`
        : kind === "value"
          ? `${fmt(current)} / ${target != null ? fmt(target) : "?"}${unit ? ` ${unit}` : ""}`
          : "";

  return (
    <div className="space-y-1">
      {percentage !== null && (
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Postęp celu"
          className="h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <div className="h-full rounded-full bg-ok" style={{ width: `${percentage}%` }} />
        </div>
      )}
      <p className="flex justify-between text-xs">
        <span className="text-muted" data-testid="goal-amount">
          {amount}
          {percentage !== null && ` (${fmt(percentage)}%)`}
        </span>
        <span className={STATUS_CLASS[status]} data-testid="goal-status">
          {GOAL_STATUS_LABELS[status]}
        </span>
      </p>
    </div>
  );
}
