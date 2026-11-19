"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "@/lib/domain/schemas";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: string; saved?: boolean } | undefined;

export async function saveProfile(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  const parsed = profileSchema.safeParse({ first_name: String(fd.get("first_name") ?? ""), last_name: String(fd.get("last_name") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ first_name: parsed.data.first_name || null, last_name: parsed.data.last_name || null })
    .not("id", "is", null);
  if (error) return { error: "Nie udało się zapisać. Spróbuj ponownie." };
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function saveTimeZone(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  const tz = String(fd.get("time_zone") ?? "");
  if (!Intl.supportedValuesOf("timeZone").includes(tz)) return { error: "Nieprawidłowa strefa czasowa" };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ time_zone: tz }).not("id", "is", null);
  if (error) return { error: "Nie udało się zapisać. Spróbuj ponownie." };
  revalidatePath("/", "layout");
  return { saved: true };
}
