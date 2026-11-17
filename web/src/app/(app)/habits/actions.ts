"use server";

import { redirect } from "next/navigation";
import { habitFromForm, rawValues, type RawValues } from "@/lib/domain/form-data";
import { activatePatch, archivePatch } from "@/lib/domain/habits";
import { fieldErrors, habitSchema, type FieldErrors } from "@/lib/domain/schemas";
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
    reminder_enabled: h.reminder_enabled,
    reminder_days: h.reminder_days,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("habits").update(row).eq("id", id)
    : await supabase.from("habits").insert(row);

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
