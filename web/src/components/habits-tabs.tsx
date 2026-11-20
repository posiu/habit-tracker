import Link from "next/link";

/** Nawyki | Cele: both live under the "Nawyki" tab of the bottom navigation. */
export function HabitsTabs({ active }: { active: "habits" | "goals" }) {
  const item = (on: boolean) => `flex h-10 items-center rounded-full px-5 text-sm font-semibold ${on ? "bg-chip text-chip-text" : "text-muted"}`;
  return (
    <nav aria-label="Nawyki i cele" className="inline-flex gap-1 rounded-full bg-surface p-1">
      <Link href="/habits" aria-current={active === "habits" ? "page" : undefined} className={item(active === "habits")}>Nawyki</Link>
      <Link href="/goals" aria-current={active === "goals" ? "page" : undefined} className={item(active === "goals")}>Cele</Link>
    </nav>
  );
}
