"use server";

import { revalidatePath } from "next/cache";
import { buildHabitEntry, dailySchema, isValidDate, todayIn } from "@/lib/domain/entries";
import { buildGoalEntry, goalLoggableOn } from "@/lib/domain/goals";
import { rawValues, type RawValues } from "@/lib/domain/form-data";
import { fieldErrors, type FieldErrors } from "@/lib/domain/schemas";
import { getTimeZone, listGoalsForDate, listHabitsForDate } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export type DayState = { errors?: FieldErrors; values?: RawValues; saved?: boolean } | undefined;

export async function saveDay(date: string, _prev: DayState, fd: FormData): Promise<DayState> {
  if (!isValidDate(date)) return { errors: { _form: "Nieprawidłowa data" }, values: rawValues(fd) };
  if (date > todayIn(await getTimeZone())) {
    return { errors: { _form: "Nie można dodawać wpisów z przyszłości" }, values: rawValues(fd) };
  }

  const moodRaw = String(fd.get("mood") ?? "").trim();
  const notesRaw = String(fd.get("notes") ?? "").trim();
  const daily = dailySchema.safeParse({
    mood: moodRaw === "" ? undefined : Number(moodRaw),
    notes: notesRaw === "" ? undefined : notesRaw,
  });
  const errors: FieldErrors = daily.success ? {} : fieldErrors(daily.error);

  // Habit types come from the database, never from the client.
  const habits = await listHabitsForDate(date);
  const entries: Record<string, unknown>[] = [];
  const clear: string[] = [];
  for (const habit of habits) {
    const raw = fd.get(`habit_${habit.id}`);
    const result = buildHabitEntry(habit.habit_type, typeof raw === "string" ? raw : null);
    if (result.kind === "error") errors[`habit_${habit.id}`] = result.message;
    else if (result.kind === "clear") clear.push(habit.id);
    else entries.push({ habit_id: habit.id, ...result.values });
  }

  const goals = (await listGoalsForDate(date)).filter((g) => goalLoggableOn(g, date));
  const goalEntries: Record<string, unknown>[] = [];
  const goalClear: string[] = [];
  for (const goal of goals) {
    const raw = fd.get(`goal_${goal.id}`);
    const dir = fd.get(`goal_${goal.id}_dir`);
    const result = buildGoalEntry(
      goal.goal_type,
      typeof raw === "string" ? raw : null,
      typeof dir === "string" ? dir : null,
    );
    if (result.kind === "error") errors[`goal_${goal.id}`] = result.message;
    else if (result.kind === "clear") goalClear.push(goal.id);
    else goalEntries.push({ goal_id: goal.id, ...result.values });
  }

  if (Object.keys(errors).length > 0 || !daily.success) return { errors, values: rawValues(fd) };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_day", {
    p_date: date,
    p_mood: daily.data.mood ?? null,
    p_notes: daily.data.notes ?? null,
    p_entries: entries,
    p_clear: clear,
    p_goal_entries: goalEntries,
    p_goal_clear: goalClear,
  });
  if (error) return { errors: { _form: "Nie udało się zapisać dnia. Spróbuj ponownie." }, values: rawValues(fd) };

  revalidatePath(`/daily/${date}`);
  return { saved: true };
}
