import { z } from "zod";
import { isValidDate } from "./entries";

export const GOAL_TYPES = ["days_doing", "days_without", "target_value", "target_date", "custom"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  days_doing: "Dni z działaniem",
  days_without: "Dni bez czegoś",
  target_value: "Wartość docelowa",
  target_date: "Termin",
  custom: "Własny (ręczny)",
};

export const GOAL_TYPE_HINTS: Record<GoalType, string> = {
  days_doing: "Odhaczasz dni, w których coś zrobiłeś. Cel to liczba takich dni.",
  days_without: "Odhaczasz dni, w których wytrwałeś bez czegoś. Cel to liczba takich dni.",
  target_value: "Dodajesz i odejmujesz wartości, aż suma osiągnie cel (np. 10 000 zł, 500 km).",
  target_date: "Postęp rośnie z upływem czasu do terminu.",
  custom: "Bez automatycznego postępu. Zamykasz cel ręcznie.",
};

/** Goal types you log in the daily screen. */
export const TRACKED_GOAL_TYPES: readonly GoalType[] = ["days_doing", "days_without", "target_value"];
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

export function goalProgress(goal: GoalCore, entries: GoalEntryLite[], today: string): GoalProgress {
  const own = entries.filter((e) => e.date >= goal.start_date);
  let percentage: number | null = null;
  let current = 0;
  let target: number | null = null;
  let kind: GoalProgress["kind"] = null;

  switch (goal.goal_type) {
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
