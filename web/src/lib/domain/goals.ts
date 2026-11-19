import { z } from "zod";
import { isValidDate } from "./entries";
import { longestStreak } from "./stats";

export const GOAL_TYPES = ["habit_days", "habit_streak", "days_doing", "days_without", "target_value", "target_date", "custom"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  habit_days: "Dni z nawyku",
  habit_streak: "Seria z nawyku",
  days_doing: "Dni z działaniem",
  days_without: "Dni bez czegoś",
  target_value: "Wartość docelowa",
  target_date: "Termin",
  custom: "Własny (ręczny)",
};

export const GOAL_TYPE_HINTS: Record<GoalType, string> = {
  habit_days: "Liczą się ukończone dni wybranego nawyku od startu celu. Nic nie odhaczasz osobno.",
  habit_streak: "Cel to najdłuższa seria wybranego nawyku od startu celu (aktualna seria może się zerować).",
  days_doing: "Odhaczasz dni, w których coś zrobiłeś. Cel to liczba takich dni.",
  days_without: "Odhaczasz dni, w których wytrwałeś bez czegoś. Cel to liczba takich dni.",
  target_value: "Dodajesz i odejmujesz wartości, aż suma osiągnie cel (np. 10 000 zł, 500 km).",
  target_date: "Postęp rośnie z upływem czasu do terminu.",
  custom: "Bez automatycznego postępu. Zamykasz cel ręcznie.",
};

/** Goal types you log in the daily screen. */
export const TRACKED_GOAL_TYPES: readonly GoalType[] = ["days_doing", "days_without", "target_value"];
export const HABIT_GOAL_TYPES: readonly GoalType[] = ["habit_days", "habit_streak"];
export const isHabitGoal = (t: GoalType) => HABIT_GOAL_TYPES.includes(t);
export const isTracked = (t: GoalType) => TRACKED_GOAL_TYPES.includes(t);

const isoDate = z.string().refine(isValidDate, "Podaj datę w formacie RRRR-MM-DD");

export const goalSchema = z
  .object({
    name: z.string().trim().min(1, "Nazwa jest wymagana").max(200, "Maksymalnie 200 znaków"),
    goal_type: z.enum(GOAL_TYPES, { error: "Wybierz typ celu" }),
    unit: z.string().trim().max(50, "Maksymalnie 50 znaków").optional(),
    category_id: z.uuid("Nieprawidłowa kategoria").optional(),
    start_date: isoDate,
    target_date: isoDate.optional(),
    target_value: z.number({ error: "Podaj liczbę" }).positive("Cel musi być większy od zera").optional(),
    habit_id: z.uuid("Nieprawidłowy nawyk").optional(),
    days_target: z
      .number({ error: "Podaj liczbę" })
      .int("Podaj całkowitą liczbę dni")
      .positive("Cel musi być większy od zera")
      .optional(),
  })
  .superRefine((g, ctx) => {
    if (g.target_date && g.target_date < g.start_date) {
      ctx.addIssue({ code: "custom", path: ["target_date"], message: "Termin nie może być wcześniejszy niż start" });
    }
    if (g.goal_type === "target_date" && !g.target_date) {
      ctx.addIssue({ code: "custom", path: ["target_date"], message: "Termin jest wymagany dla tego typu celu" });
    }
    if (isHabitGoal(g.goal_type) && !g.habit_id) {
      ctx.addIssue({ code: "custom", path: ["habit_id"], message: "Wybierz nawyk" });
    }
    if (isHabitGoal(g.goal_type) && g.days_target === undefined) {
      ctx.addIssue({ code: "custom", path: ["days_target"], message: "Podaj liczbę dni" });
    }
    if (g.goal_type === "target_value" && g.target_value === undefined) {
      ctx.addIssue({ code: "custom", path: ["target_value"], message: "Podaj wartość docelową" });
    }
  });
export type GoalInput = z.infer<typeof goalSchema>;

// ---- daily entries ---------------------------------------------------------

export type GoalEntryValues = { value: number | null; boolean_value: boolean | null; is_increment: boolean };
export type GoalEntryResult =
  | { kind: "set"; values: GoalEntryValues }
  | { kind: "clear" }
  | { kind: "error"; message: string };

/** One raw form value -> stored goal entry (port of Rails GoalEntryForm). */
export function buildGoalEntry(
  type: GoalType,
  raw: string | null | undefined,
  direction: string | null | undefined,
): GoalEntryResult {
  if (type === "days_doing" || type === "days_without") {
    return raw === "on"
      ? { kind: "set", values: { value: null, boolean_value: true, is_increment: true } }
      : { kind: "clear" };
  }
  if (type !== "target_value") return { kind: "clear" };

  const text = (raw ?? "").trim();
  if (text === "") return { kind: "clear" };
  const n = Number(text.replace(",", "."));
  if (!Number.isFinite(n)) return { kind: "error", message: "Podaj liczbę" };
  if (n <= 0) return { kind: "error", message: "Wartość musi być większa od zera" };
  return { kind: "set", values: { value: n, boolean_value: null, is_increment: direction !== "dec" } };
}

// ---- progress --------------------------------------------------------------

export type GoalCore = {
  goal_type: GoalType;
  start_date: string;
  target_date: string | null;
  completed_at: string | null;
  target_value: number | null;
  days_doing_target: number | null;
  days_without_target: number | null;
};

/** Completed days of the habit behind a habit goal, and which days it was scheduled. */
export type HabitData = { dates: string[]; scheduled: (date: string) => boolean };

export type GoalEntryLite = {
  date: string;
  value: number | null;
  boolean_value: boolean | null;
  is_increment: boolean | null;
};

export type GoalStatus = "not_started" | "in_progress" | "reached" | "overdue" | "completed";

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: "Jeszcze nie ruszył",
  in_progress: "W toku",
  reached: "Osiągnięty",
  overdue: "Po terminie",
  completed: "Zamknięty",
};

export type GoalProgress = {
  /** 0-100, one decimal; null when the goal has no automatic progress (custom). */
  percentage: number | null;
  current: number;
  target: number | null;
  kind: "days" | "value" | "time" | null;
  status: GoalStatus;
};

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const cap = (n: number) => Math.min(100, round1(n));

/** Signed value of one target_value entry (port of Rails GoalEntry#effective_value). */
export function effectiveValue(e: Pick<GoalEntryLite, "value" | "is_increment">): number {
  const v = e.value ?? 0;
  return e.is_increment === false ? -v : v;
}

/** Target day count: explicit, else start..target_date inclusive, else 30 (as in Rails). */
function daysTarget(goal: GoalCore, explicit: number | null): number {
  if (explicit && explicit > 0) return explicit;
  if (goal.target_date) return daysBetween(goal.start_date, goal.target_date) + 1;
  return 30;
}

export function goalProgress(goal: GoalCore, entries: GoalEntryLite[], today: string, habit?: HabitData): GoalProgress {
  const own = entries.filter((e) => e.date >= goal.start_date);
  let percentage: number | null = null;
  let current = 0;
  let target: number | null = null;
  let kind: GoalProgress["kind"] = null;

  switch (goal.goal_type) {
    case "habit_days":
    case "habit_streak": {
      // Only days from the goal's start count (Q13); the streak is the best one since then (Q14).
      const since = (habit?.dates ?? []).filter((d) => d >= goal.start_date && d <= today);
      current = goal.goal_type === "habit_days" ? new Set(since).size : longestStreak(since, habit?.scheduled);
      target = daysTarget(goal, goal.days_doing_target);
      percentage = cap((current / target) * 100);
      kind = "days";
      break;
    }
    case "days_doing":
    case "days_without": {
      const explicit = goal.goal_type === "days_doing" ? goal.days_doing_target : goal.days_without_target;
      current = own.filter((e) => e.boolean_value === true).length;
      target = daysTarget(goal, explicit);
      percentage = cap((current / target) * 100);
      kind = "days";
      break;
    }
    case "target_value": {
      current = own.reduce((sum, e) => sum + effectiveValue(e), 0);
      target = goal.target_value;
      percentage = target && target > 0 ? cap((current / target) * 100) : 0;
      kind = "value";
      break;
    }
    case "target_date": {
      const total = daysBetween(goal.start_date, goal.target_date ?? goal.start_date);
      const elapsed = Math.max(0, Math.min(total, daysBetween(goal.start_date, today)));
      current = elapsed;
      target = total;
      percentage = total === 0 ? (today >= goal.start_date ? 100 : 0) : cap((elapsed / total) * 100);
      kind = "time";
      break;
    }
    case "custom":
      break;
  }

  let status: GoalStatus;
  if (goal.completed_at) {
    status = "completed";
    if (goal.goal_type === "target_date") percentage = 100;
  } else if (goal.start_date > today) status = "not_started";
  else if (goal.goal_type !== "target_date" && goal.goal_type !== "custom" && percentage !== null && percentage >= 100)
    status = "reached";
  else if (goal.target_date && today > goal.target_date) status = "overdue";
  else status = "in_progress";

  return { percentage, current, target, kind, status };
}

export function goalDaysRemaining(goal: Pick<GoalCore, "target_date">, today: string): number | null {
  return goal.target_date ? daysBetween(today, goal.target_date) : null;
}

/** A goal is loggable on a day from its start until it was closed. */
export function goalLoggableOn(goal: { start_date: string; completed_at: string | null }, date: string): boolean {
  if (goal.start_date > date) return false;
  return goal.completed_at === null || goal.completed_at.slice(0, 10) >= date;
}

// ---- progress over time (REP-2) --------------------------------------------

export type GoalSeriesPoint = { date: string; value: number };

/**
 * Running progress of a goal as a step series: the start (0), every day on which the value changed,
 * and today (or the closing day). Same units as `goalProgress().current`: days or the summed value.
 * Goals without a tracked value (target_date, custom) have no series.
 */
export function goalSeries(goal: GoalCore, entries: GoalEntryLite[], today: string, habit?: HabitData): GoalSeriesPoint[] {
  const end = goal.completed_at && goal.completed_at.slice(0, 10) < today ? goal.completed_at.slice(0, 10) : today;
  if (goal.start_date > end) return [];
  const points: GoalSeriesPoint[] = [{ date: goal.start_date, value: 0 }];
  const push = (date: string, value: number) => {
    const last = points[points.length - 1];
    if (last.value === value && date !== end) return;
    if (last.date === date) last.value = value;
    else points.push({ date, value });
  };

  switch (goal.goal_type) {
    case "days_doing":
    case "days_without":
    case "target_value": {
      const own = entries.filter((e) => e.date >= goal.start_date && e.date <= end).sort((a, b) => a.date.localeCompare(b.date));
      let running = 0;
      for (const e of own) {
        if (goal.goal_type === "target_value") running += effectiveValue(e);
        else if (e.boolean_value === true) running += 1;
        else continue;
        push(e.date, running);
      }
      break;
    }
    case "habit_days":
    case "habit_streak": {
      const dates = [...new Set((habit?.dates ?? []).filter((d) => d >= goal.start_date && d <= end))].sort();
      dates.forEach((d, i) => {
        const upTo = dates.slice(0, i + 1);
        push(d, goal.goal_type === "habit_days" ? upTo.length : longestStreak(upTo, habit?.scheduled));
      });
      break;
    }
    default:
      return [];
  }
  push(end, points[points.length - 1].value);
  return points;
}
