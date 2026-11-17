import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Pulpit</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Statystyki i heatmapa pojawią się po dodaniu wpisów dziennych. Na razie zacznij od{" "}
        <Link href="/habits" className="underline">
          nawyków
        </Link>{" "}
        i{" "}
        <Link href="/categories" className="underline">
          kategorii
        </Link>
        .
      </p>
    </main>
  );
}
