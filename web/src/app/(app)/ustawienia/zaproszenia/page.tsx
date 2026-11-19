import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteUser } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { InviteForm } from "@/components/invite-form";
import { getSessionUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

async function Panel() {
  const me = await getSessionUser();
  if (!me?.isAdmin) notFound();

  const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 200 });
  const users = (data?.users ?? []).sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-surface p-4">
        <InviteForm />
      </div>
      <section aria-label="Użytkownicy" className="space-y-2">
        <h2 className="text-sm font-semibold">Użytkownicy ({users.length})</h2>
        <ul className="space-y-2" data-testid="user-list">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-3xl bg-surface p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.email}</p>
                <p className="text-xs text-muted">{u.last_sign_in_at ? "aktywny" : "zaproszony, jeszcze się nie zalogował"}</p>
              </div>
              {u.id !== me.id && (
                <div className="ml-auto">
                  <DeleteButton
                    action={deleteUser.bind(null, u.id)}
                    confirmText={`Usunąć konto ${u.email} razem z wszystkimi danymi? Tej operacji nie można cofnąć.`}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function InvitesPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Zaproszenia</h1>
        <Link href="/ustawienia" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">Wróć</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Panel />
      </Suspense>
    </main>
  );
}
