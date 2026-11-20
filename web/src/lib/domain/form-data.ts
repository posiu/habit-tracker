import type { CategoryInput, HabitInput } from "./schemas";

function text(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export function categoryFromForm(fd: FormData): Record<keyof CategoryInput, unknown> {
  return {
    name: text(fd, "name") ?? "",
    color: text(fd, "color"),
    icon: text(fd, "icon"),
    description: text(fd, "description"),
  };
}

export function habitFromForm(fd: FormData): Record<keyof HabitInput, unknown> {
  const target = text(fd, "target_value");
  return {
    name: text(fd, "name") ?? "",
    habit_type: text(fd, "habit_type"),
    unit: text(fd, "unit"),
    target_value: target === undefined ? undefined : Number(target.replace(",", ".")),
    category_id: text(fd, "category_id"),
    start_date: text(fd, "start_date"),
    end_date: text(fd, "end_date"),
    identity: text(fd, "identity"),
    plan_text: text(fd, "plan_text"),
    minimum_text: text(fd, "minimum_text"),
    anchor_habit_id: text(fd, "anchor_habit_id"),
    goal_ids: fd.getAll("goal_ids").filter((v): v is string => typeof v === "string"),
    schedule_days: fd.getAll("schedule_days").map((d) => Number(d)),
  };
}

export type RawValues = Record<string, string | string[]>;

/** Echo of submitted fields, so a form can repopulate itself after a validation error. */
export function rawValues(fd: FormData): RawValues {
  const out: RawValues = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = key === "schedule_days" || key === "goal_ids" ? all : (all[0] ?? "");
  }
  return out;
}

function num(fd: FormData, key: string): number | undefined {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return undefined;
  return Number(v.trim().replace(",", "."));
}

export function goalFromForm(fd: FormData): Record<string, unknown> {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
  };
  return {
    name: str("name") ?? "",
    goal_type: str("goal_type"),
    unit: str("unit"),
    category_id: str("category_id"),
    start_date: str("start_date"),
    target_date: str("target_date"),
    target_value: num(fd, "target_value"),
    days_target: num(fd, "days_target"),
    habit_id: str("habit_id"),
  };
}
