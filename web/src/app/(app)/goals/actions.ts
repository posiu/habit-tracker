"use server";

import { redirect } from "next/navigation";
import { goalFromForm, rawValues, type RawValues } from "@/lib/domain/form-data";
import { goalSchema } from "@/lib/domain/goals";
import { fieldErrors, type FieldErrors } from "@/lib/domain/schemas";
import { createClient } from "@/lib/supabase/server";

export type FormState = { errors?: FieldErrors; values?: RawValues } | undefined;

export async function saveGoal(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = goalSchema.safeParse(goalFromForm(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: rawValues(fd) };

  const g = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_goal", {
    p_id: id,
    p_name: g.name,
    p_goal_type: g.goal_type,
    p_unit: g.unit ?? null,
    p_category_id: g.category_id ?? null,
    p_start_date: g.start_date,
    p_target_date: g.target_date ?? null,
    p_target_value: g.target_value ?? null,
    p_days_target: g.days_target ?? null,
  });
  if (error) {
    return { errors: { _form: "Nie udało się zapisać celu. Spróbuj ponownie." }, values: rawValues(fd) };
  }
  redirect(`/goals/${data}`);
}

export async function completeGoal(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").update({ completed_at: new Date().toISOString(), is_active: false }).eq("id", id);
  redirect("/goals");
}

export async function reopenGoal(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").update({ completed_at: null, is_active: true }).eq("id", id);
  redirect("/goals");
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);
  redirect("/goals");
}
