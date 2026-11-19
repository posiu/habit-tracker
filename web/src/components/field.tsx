import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-2xl border-0 bg-surface-2 px-4 py-3 text-base text-foreground outline-none placeholder:text-faint focus:ring-2 focus:ring-accent";

/** Pill used for single/multi choices (weekdays, moods): style via the hidden input's :checked state. */
export const chipClass =
  "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-surface-2 px-4 text-sm font-semibold text-soft has-[:checked]:bg-chip has-[:checked]:text-chip-text has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent";

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1 text-sm">
      <label className="block space-y-1.5">
        <span className="block text-xs text-muted">{label}</span>
        {children}
      </label>
      {error && (
        <span role="alert" className="block text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-14 flex-1 rounded-full bg-accent px-6 text-base font-semibold text-accent-text disabled:opacity-60"
    >
      {pending ? "Zapisywanie…" : children}
    </button>
  );
}
