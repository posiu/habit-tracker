import { createClient } from "@/lib/supabase/server";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function publicSignupAllowed(): boolean {
  return process.env.ALLOW_PUBLIC_SIGNUP === "true";
}

/** The signed-in user (from the verified JWT) and whether they are listed in ADMIN_EMAILS. */
export async function getSessionUser(): Promise<{ id: string; email: string; isAdmin: boolean } | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const email = String(claims.email ?? "").toLowerCase();
  return { id: claims.sub, email, isAdmin: email !== "" && adminEmails().includes(email) };
}
