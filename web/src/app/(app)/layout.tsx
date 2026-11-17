import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

async function UserEmail() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return <span className="text-zinc-500">{String(data?.claims.email ?? "")}</span>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
        <Link href="/" className="font-semibold">
          Habit Tracker
        </Link>
        <nav className="flex gap-4">
          <Link href="/habits" className="hover:underline">
            Nawyki
          </Link>
          <Link href="/categories" className="hover:underline">
            Kategorie
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Suspense fallback={null}>
            <UserEmail />
          </Suspense>
          <form action={logout}>
            <button type="submit" className="underline">
              Wyloguj
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
