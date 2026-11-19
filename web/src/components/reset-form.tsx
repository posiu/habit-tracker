"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset, type AuthState } from "@/app/(auth)/actions";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestReset, undefined);
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <form action={action} className="w-full max-w-sm space-y-5">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">Reset hasła</h1>
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
        {state?.message && <p role="status" className="text-sm text-ok-text">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-14 w-full rounded-full bg-accent text-base font-semibold text-accent-text disabled:opacity-60"
        >
          {pending ? "Chwileczkę…" : "Wyślij link"}
        </button>
        <p className="text-sm text-muted">
          <Link href="/login" className="underline">Wróć do logowania</Link>
        </p>
      </form>
    </main>
  );
}
