"use server";

import { redirect } from "next/navigation";
import { publicSignupAllowed } from "@/lib/admin";
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
  if (!publicSignupAllowed()) return { error: "Rejestracja jest tylko na zaproszenie." };
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

/** Sends a password-reset e-mail. Always answers the same, so it does not reveal which addresses have accounts. */
export async function requestReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (email) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email);
  }
  return { message: "Jeśli konto istnieje, wysłaliśmy link do ustawienia nowego hasła." };
}
