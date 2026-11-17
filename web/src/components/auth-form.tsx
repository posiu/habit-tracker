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
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <label className="block space-y-1 text-sm">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>Hasło</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={passwordAutoComplete}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        </label>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state?.message && <p className="text-sm text-green-700 dark:text-green-400">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Chwileczkę…" : submitLabel}
        </button>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {alt.text}{" "}
          <Link href={alt.href} className="underline">
            {alt.label}
          </Link>
        </p>
      </form>
    </main>
  );
}
