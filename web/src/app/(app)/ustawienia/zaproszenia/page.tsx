import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteUser } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { InviteForm } from "@/components/invite-form";
import { ACTIVITY_LABELS, activityStatus, daysAgo, lastMovement, type ActivityStatus } from "@/lib/domain/activity";
import { getSessionUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

async function Panel() {
  const me = await getSessionUser();
  if (!me?.isAdmin) notFound();

  const admin = createAdminClient();
  // all accounts (the API pages through them)
  const all: User[] = [];
  for (let page = 1; ; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    all.push(...(data?.users ?? []));
    if ((data?.users.length ?? 0) < 200) break;
  }
  const { data: activity } = await admin.rpc("user_activity");
  type Activity = { user_id: string; last_activity: string | null; actions_7d: number };
  const byUser = new Map(((activity ?? []) as Activity[]).map((a) => [a.user_id, a]));

  const now = new Date();
  const users = all
    .map((u) => {
      const a = byUser.get(u.id);
      const last = lastMovement(a?.last_activity, u.last_sign_in_at);
      return { u, last, status: activityStatus(last, now), actions7d: Number(a?.actions_7d ?? 0) };
    })
    .sort((x, y) => (y.last?.getTime() ?? 0) - (x.last?.getTime() ?? 0) || (x.u.email ?? "").localeCompare(y.u.email ?? ""));
  const counts: Record<ActivityStatus, number> = { active: 0, fading: 0, inactive: 0 };
  for (const x of users) counts[x.status]++;
  const badge: Record<ActivityStatus, string> = {
    active: "bg-ok/20 text-ok-text",
    fading: "bg-surface-2 text-soft",
    inactive: "bg-surface-2 text-muted",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-surface p-4">
        <InviteForm />
      </div>
      <section aria-label="Użytkownicy" className="space-y-3">
        <h2 className="text-sm font-semibold">Użytkownicy ({users.length})</h2>
        <ul className="grid grid-cols-3 gap-2 text-center" data-testid="user-counts">
          {(["active", "fading", "inactive"] as const).map((k) => (
            <li key={k} className="rounded-2xl bg-surface p-3">
              <p className="text-xl font-bold">{counts[k]}</p>
              <p className="text-xs text-muted">{ACTIVITY_LABELS[k]}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          Aktywne: jakikolwiek ruch (zapis danych albo logowanie) w ostatnich 7 dniach. Nieaktywne: nic od ponad 14 dni.
        </p>
        <ul className="space-y-2" data-testid="user-list">
          {users.map(({ u, last, status, actions7d }) => (
            <li key={u.id} data-status={status} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-3xl bg-surface p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.email}</p>
                <p className="text-xs text-muted">
                  {last ? `ostatni ruch ${daysAgo(last, now) === 0 ? "dziś" : `${daysAgo(last, now)} dni temu`}` : u.last_sign_in_at ? "" : "zaproszony, jeszcze się nie zalogował"}
                  {last && ` · ${actions7d} zapisów w 7 dni`}
                  {` · konto od ${u.created_at.slice(0, 10)}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[status]}`}>{ACTIVITY_LABELS[status]}</span>
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
        <h1 className="text-[34px] font-bold tracking-tight">Konta</h1>
        <Link href="/ustawienia" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">Wróć</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Panel />
      </Suspense>
    </main>
  );
}
