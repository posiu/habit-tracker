import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

async function CurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Zalogowano jako {String(data?.claims.email ?? "")}
    </p>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Habit Tracker</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <CurrentUser />
      </Suspense>
      <form action={logout}>
        <button type="submit" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
          Wyloguj
        </button>
      </form>
    </main>
  );
}
