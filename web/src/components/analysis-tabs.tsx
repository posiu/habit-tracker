import Link from "next/link";

const TABS = [
  { key: "week", href: "/analiza/tydzien", label: "Tydzień" },
  { key: "month", href: "/analiza/miesiac", label: "Miesiąc" },
  { key: "year", href: "/analiza", label: "Rok" },
] as const;

export function AnalysisTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <h1 className="text-[34px] font-bold tracking-tight">Analiza</h1>
      <nav aria-label="Zakres analizy" className="flex gap-1 rounded-full bg-surface-2 p-1 text-sm font-semibold">
        {TABS.map((t) =>
          t.key === active ? (
            <span key={t.key} aria-current="page" className="flex h-9 items-center rounded-full bg-chip px-3.5 text-chip-text">
              {t.label}
            </span>
          ) : (
            <Link key={t.key} href={t.href} className="flex h-9 items-center rounded-full px-3.5 text-muted">
              {t.label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
