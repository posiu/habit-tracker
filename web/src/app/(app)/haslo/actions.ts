"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PasswordState = { error?: string } | undefined;

export async function setPassword(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Hasło musi mieć co najmniej 8 znaków." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Hasła nie są takie same." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Nie udało się ustawić hasła. Poproś o nowy link." };
  redirect("/");
}
