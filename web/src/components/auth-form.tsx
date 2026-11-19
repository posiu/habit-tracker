"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";

type Props = {
  title: string;
  submitLabel: string;
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  alt: { text: string; href: string; label: string };
  passwordAutoComplete: "current-password" | "new-password";
};

export function AuthForm({ title, submitLabel, action, alt, passwordAutoComplete }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <form action={formAction} className="w-full max-w-sm space-y-5">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">{title}</h1>

        <label className="block space-y-1.5 text-sm">
          <span className="block text-xs text-muted">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-2xl border-0 bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="block text-xs text-muted">Hasło</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={passwordAutoComplete}
            className="w-full rounded-2xl border-0 bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state?.message && <p className="text-sm text-ok-text">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="h-14 w-full rounded-full bg-accent text-base font-semibold text-accent-text disabled:opacity-60"
        >
          {pending ? "Chwileczkę…" : submitLabel}
        </button>

        <p className="text-sm text-muted">
          {alt.text}{" "}
          <Link href={alt.href} className="underline">
            {alt.label}
          </Link>
        </p>
      </form>
    </main>
  );
}
