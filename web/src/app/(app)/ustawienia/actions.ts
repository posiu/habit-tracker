"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: string; saved?: boolean } | undefined;

export async function saveTimeZone(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  const tz = String(fd.get("time_zone") ?? "");
  if (!Intl.supportedValuesOf("timeZone").includes(tz)) return { error: "Nieprawidłowa strefa czasowa" };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ time_zone: tz }).not("id", "is", null);
  if (error) return { error: "Nie udało się zapisać. Spróbuj ponownie." };
  revalidatePath("/", "layout");
  return { saved: true };
}
