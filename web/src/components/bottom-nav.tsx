"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string; match?: string; also?: string[] }[] = [
  { href: "/", label: "Dziś" },
  { href: "/analiza/tydzien", label: "Analiza", match: "/analiza" },
  { href: "/habits", label: "Nawyki", also: ["/goals"] },
  { href: "/ustawienia", label: "Ustawienia" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-4 bottom-6 z-10 mx-auto flex max-w-md items-center gap-2.5">
      <nav aria-label="Główna nawigacja" className="flex h-16 flex-1 items-center justify-around rounded-full bg-surface-2 px-2 text-xs font-medium text-muted">
        {ITEMS.map((item) => {
          const active = [item.match ?? item.href, ...(item.also ?? [])].some((h) => isActive(pathname, h));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-full px-3.5 ${active ? "bg-nav-active font-semibold text-foreground" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/habits/new"
        aria-label="Dodaj nawyk"
        className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-text"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
