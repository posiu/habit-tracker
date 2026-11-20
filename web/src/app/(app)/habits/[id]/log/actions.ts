"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildHabitEntry, isValidDate, todayIn } from "@/lib/domain/entries";
import { rawValues, type RawValues } from "@/lib/domain/form-data";
import type { FieldErrors } from "@/lib/domain/schemas";
import { getTimeZone, listHabitsForDate } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export type LogState = { errors?: FieldErrors; values?: RawValues } | undefined;

/** Records (or clears) one habit's entry for a day, without touching the day's mood, notes or other habits. */
export async function logHabit(habitId: string, date: string, _prev: LogState, fd: FormData): Promise<LogState> {
  const today = todayIn(await getTimeZone());
  if (!isValidDate(date) || date > today) return { errors: { _form: "Nieprawidłowa data" }, values: rawValues(fd) };

  const habit = (await listHabitsForDate(date)).find((h) => h.id === habitId);
  if (!habit) return { errors: { _form: "Ten nawyk nie obowiązuje w tym dniu" }, values: rawValues(fd) };

  const raw = fd.get("value");
  const result = buildHabitEntry(habit.habit_type, typeof raw === "string" ? raw : null, habit.target_value);
  if (result.kind === "error") return { errors: { value: result.message }, values: rawValues(fd) };

  const supabase = await createClient();
  const { data: day, error } = await supabase
    .from("daily_entries")
    .upsert({ entry_date: date }, { onConflict: "user_id,entry_date" })
    .select("id")
    .single();
  let failed = !!error;
  if (!failed && result.kind === "set") {
    const { error: e } = await supabase
      .from("habit_entries")
      .upsert({ daily_entry_id: day!.id, habit_id: habitId, ...result.values, is_minimum: false }, { onConflict: "daily_entry_id,habit_id" });
    failed = !!e;
  } else if (!failed) {
    const { error: e } = await supabase.from("habit_entries").delete().eq("daily_entry_id", day!.id).eq("habit_id", habitId);
    failed = !!e;
  }
  if (failed) return { errors: { _form: "Nie udało się zapisać. Spróbuj ponownie." }, values: rawValues(fd) };

  revalidatePath("/");
  revalidatePath(`/daily/${date}`);
  redirect(date === today ? "/" : `/daily/${date}`);
}
