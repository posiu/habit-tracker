import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { ProfileForm } from "@/components/profile-form";
import { ThemeSwitch } from "@/components/theme-switch";
import { TimeZoneForm } from "@/components/time-zone-form";
import { getSessionUser } from "@/lib/admin";
import { getProfileNames, getTimeZone, getUserEmail } from "@/lib/queries";

async function Settings() {
  const [email, tz, me, names] = await Promise.all([getUserEmail(), getTimeZone(), getSessionUser(), getProfileNames()]);
  const fullName = `${names.first_name} ${names.last_name}`.trim();
  const zones = Intl.supportedValuesOf("timeZone");
  if (!zones.includes(tz)) zones.push(tz);
  const row = "flex min-h-14 items-center justify-between px-4 text-[15px]";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-3xl bg-surface p-4">
        <span aria-hidden="true" className="flex size-13 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent-ink">
          {(fullName || email).slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold">{fullName || email}</p>
          {fullName && <p className="truncate text-sm text-muted">{email}</p>}
        </div>
      </div>

      <div className="rounded-3xl bg-surface p-4">
        <ProfileForm firstName={names.first_name} lastName={names.last_name} />
      </div>

      <div className="rounded-3xl bg-surface p-4">
        <ThemeSwitch />
      </div>

      <div className="rounded-3xl bg-surface p-4">
        <TimeZoneForm current={tz} zones={zones} />
      </div>

      <nav aria-label="Ustawienia" className="overflow-hidden rounded-3xl bg-surface">
        <Link href="/categories" className={`${row} border-b border-surface-2`}>
          <span>Kategorie</span>
          <span className="text-muted">›</span>
        </Link>
        <a href="/eksport" download className={`${row} border-b border-surface-2`}>
          <span>Eksport danych (CSV)</span>
          <span className="text-muted">Pobierz</span>
        </a>
        <Link href="/goals" className={me?.isAdmin ? `${row} border-b border-surface-2` : row}>
          <span>Cele</span>
          <span className="text-muted">›</span>
        </Link>
        {me?.isAdmin && (
          <Link href="/ustawienia/zaproszenia" className={row}>
            <span>Konta i zaproszenia</span>
            <span className="text-muted">›</span>
          </Link>
        )}
      </nav>

      <div className="overflow-hidden rounded-3xl bg-surface">
        <form action={logout}>
          <button type="submit" className={`${row} w-full text-left text-red-600 dark:text-red-400`}>
            Wyloguj
          </button>
        </form>
      </div>
      <p className="px-2 text-xs leading-5 text-faint">Rejestracja jest tylko na zaproszenie. Usunięcie konta: napisz do administratora.</p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-[34px] font-bold tracking-tight">Ustawienia</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Settings />
      </Suspense>
    </main>
  );
}
