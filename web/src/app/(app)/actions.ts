"use server";

import { revalidatePath } from "next/cache";
import { todayIn } from "@/lib/domain/entries";
import { getTimeZone, listHabitsForDate } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

/** One-tap check-in for a yes/no habit today. Other habit types go through the day form. */
export async function checkIn(habitId: string, done: boolean): Promise<void> {
  const today = todayIn(await getTimeZone());
  const habit = (await listHabitsForDate(today)).find((h) => h.id === habitId);
  if (!habit || habit.habit_type !== "boolean") return;

  const supabase = await createClient();
  const { data: day, error } = await supabase
    .from("daily_entries")
    .upsert({ entry_date: today }, { onConflict: "user_id,entry_date" })
    .select("id")
    .single();
  if (error) throw error;

  if (done) {
    const { error: e } = await supabase
      .from("habit_entries")
      .upsert(
        { daily_entry_id: day.id, habit_id: habitId, completed: true, boolean_value: true },
        { onConflict: "daily_entry_id,habit_id" },
      );
    if (e) throw e;
  } else {
    const { error: e } = await supabase.from("habit_entries").delete().eq("daily_entry_id", day.id).eq("habit_id", habitId);
    if (e) throw e;
  }
  revalidatePath("/");
  revalidatePath(`/daily/${today}`);
}
