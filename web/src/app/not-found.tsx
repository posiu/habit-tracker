import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Nie znaleziono strony</h1>
      <p className="text-sm text-muted">Ta strona nie istnieje albo nie masz do niej dostępu.</p>
      <Link href="/" className="flex h-11 items-center rounded-full bg-chip px-5 text-[15px] font-semibold text-chip-text">
        Wróć do ekranu Dziś
      </Link>
    </main>
  );
}
