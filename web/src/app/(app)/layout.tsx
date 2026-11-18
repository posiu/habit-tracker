import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

async function UserEmail() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return <span>{String(data?.claims.email ?? "")}</span>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-36 pt-8">
      {children}
      <footer className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
        <Suspense fallback={null}>
          <UserEmail />
        </Suspense>
        <form action={logout}>
          <button type="submit" className="min-h-11 underline">
            Wyloguj
          </button>
        </form>
      </footer>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
