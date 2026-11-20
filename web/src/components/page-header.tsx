import Link from "next/link";
import type { ReactNode } from "react";

/** "‹ Label" link to the parent screen, shown above the page title. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="-ml-1 inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-soft hover:bg-surface-2">
      <span aria-hidden="true">‹</span> {label}
    </Link>
  );
}

/** Page title with an optional way back and an optional action on the right. */
export function PageHeader({ title, back, children }: { title: string; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className="space-y-1">
      {back && <BackLink href={back.href} label={back.label} />}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[34px] font-bold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}
