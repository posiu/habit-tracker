"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Coś poszło nie tak</h1>
      <p className="text-sm text-muted">Nie udało się wczytać tej strony. Spróbuj ponownie, a jeśli błąd wraca, wróć do ekranu Dziś.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="h-11 rounded-full bg-chip px-5 text-[15px] font-semibold text-chip-text">
          Spróbuj ponownie
        </button>
        <Link href="/" className="flex h-11 items-center rounded-full bg-surface-2 px-5 text-[15px] font-semibold">
          Dziś
        </Link>
      </div>
    </main>
  );
}
