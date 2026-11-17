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
    reminder_enabled: fd.get("reminder_enabled") === "on",
    reminder_days: fd.getAll("reminder_days").map((d) => Number(d)),
  };
}

export type RawValues = Record<string, string | string[]>;

/** Echo of submitted fields, so a form can repopulate itself after a validation error. */
export function rawValues(fd: FormData): RawValues {
  const out: RawValues = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = key === "reminder_days" ? all : (all[0] ?? "");
  }
  return out;
}
