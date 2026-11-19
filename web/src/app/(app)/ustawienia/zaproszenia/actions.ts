"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteState = { error?: string; message?: string } | undefined;

export async function inviteUser(_prev: InviteState, fd: FormData): Promise<InviteState> {
  const me = await getSessionUser();
  if (!me?.isAdmin) return { error: "Brak uprawnień." };

  const email = z.email().safeParse(String(fd.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { error: "Podaj poprawny adres e-mail." };

  const { error } = await createAdminClient().auth.admin.inviteUserByEmail(email.data);
  if (error) return { error: "Nie udało się wysłać zaproszenia. Sprawdź adres albo spróbuj ponownie." };
  revalidatePath("/ustawienia/zaproszenia");
  return { message: `Zaproszenie wysłane na ${email.data}.` };
}

export async function deleteUser(userId: string): Promise<void> {
  const me = await getSessionUser();
  if (!me?.isAdmin || me.id === userId) return; // admins cannot delete themselves
  await createAdminClient().auth.admin.deleteUser(userId);
  revalidatePath("/ustawienia/zaproszenia");
}
