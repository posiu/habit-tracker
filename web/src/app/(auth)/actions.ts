"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "Nieprawidłowy e-mail lub hasło." };
  redirect("/");
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Hasło musi mieć co najmniej 8 znaków." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
  });
  if (error) return { error: error.message };

  // With e-mail confirmation enabled (production) there is no session yet.
  if (!data.session) {
    return { message: "Sprawdź skrzynkę i potwierdź adres e-mail, aby się zalogować." };
  }
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
