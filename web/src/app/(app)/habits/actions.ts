"use server";

import { redirect } from "next/navigation";
import { todayIn } from "@/lib/domain/entries";
import { habitFromForm, rawValues, type RawValues } from "@/lib/domain/form-data";
import { activatePatch, archivePatch } from "@/lib/domain/habits";
import { fieldErrors, habitSchema, type FieldErrors } from "@/lib/domain/schemas";
import { sameDays, scheduleOn } from "@/lib/domain/schedule";
import { getTimeZone, listSchedules } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export type FormState = { errors?: FieldErrors; values?: RawValues } | undefined;

export async function saveHabit(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = habitSchema.safeParse(habitFromForm(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: rawValues(fd) };

  const h = parsed.data;
  const row = {
    name: h.name,
    habit_type: h.habit_type,
    unit: h.unit ?? null,
    target_value: h.target_value ?? null,
    category_id: h.category_id ?? null,
    start_date: h.start_date,
    end_date: h.end_date ?? null,
    identity: h.identity ?? null,
    plan_text: h.plan_text ?? null,
    minimum_text: h.minimum_text ?? null,
    anchor_habit_id: h.anchor_habit_id && h.anchor_habit_id !== id ? h.anchor_habit_id : null,
  };

  const supabase = await createClient();
  let habitId = id;
  let error;
  if (id) {
    ({ error } = await supabase.from("habits").update(row).eq("id", id));
  } else {
    const res = await supabase.from("habits").insert(row).select("id").single();
    error = res.error;
    habitId = res.data?.id ?? null;
  }

  if (!error && habitId) {
    // A schedule change applies from today on; a new habit's schedule from its start date.
    const existing = id ? await listSchedules([habitId]) : [];
    const today = todayIn(await getTimeZone());
    const current = scheduleOn(existing, today);
    if (!id || !sameDays(current?.days ?? [0, 1, 2, 3, 4, 5, 6], h.schedule_days)) {
      const { error: e } = await supabase
        .from("habit_schedules")
        .upsert(
          { habit_id: habitId, effective_from: id ? today : h.start_date, days: h.schedule_days },
          { onConflict: "habit_id,effective_from" },
        );
      error = e;
    }
  }

  if (!error && habitId) {
    // Links to goals counted from this habit: link the ticked ones, unlink the unticked (open goals only).
    const { error: unlinkError } = await supabase
      .from("goals")
      .update({ habit_id: null })
      .eq("habit_id", habitId)
      .is("completed_at", null)
      .not("id", "in", `(${h.goal_ids.join(",") || "00000000-0000-0000-0000-000000000000"})`);
    error = unlinkError;
    if (!error && h.goal_ids.length > 0) {
      ({ error } = await supabase.from("goals").update({ habit_id: habitId }).in("id", h.goal_ids));
    }
  }

  if (error) return { errors: { _form: "Nie udało się zapisać nawyku. Spróbuj ponownie." }, values: rawValues(fd) };
  redirect("/habits");
}

export async function archiveHabit(id: string, startDate: string) {
  const supabase = await createClient();
  await supabase.from("habits").update(archivePatch(startDate)).eq("id", id);
  redirect("/habits");
}

export async function activateHabit(id: string) {
  const supabase = await createClient();
  await supabase.from("habits").update(activatePatch()).eq("id", id);
  redirect("/habits?view=archived");
}

export async function deleteHabit(id: string) {
  const supabase = await createClient();
  await supabase.from("habits").delete().eq("id", id);
  redirect("/habits");
}
