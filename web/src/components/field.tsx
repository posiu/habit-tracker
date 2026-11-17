import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1 text-sm">
      <label className="block space-y-1">
        <span className="font-medium">{label}</span>
        {children}
      </label>
      {error && (
        <span role="alert" className="block text-red-600">
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
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Zapisywanie…" : children}
    </button>
  );
}
