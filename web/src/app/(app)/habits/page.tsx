import Link from "next/link";
import { Suspense } from "react";
import { activateHabit, archiveHabit, deleteHabit } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { HABIT_TYPE_LABELS } from "@/lib/domain/schemas";
import { listHabits } from "@/lib/queries";

async function HabitList({ searchParams }: { searchParams: PageProps<"/habits">["searchParams"] }) {
  const { view } = await searchParams;
  const archived = view === "archived";
  const habits = await listHabits(!archived);

  return (
    <>
      <div className="flex gap-4 text-sm">
        <Link href="/habits" className={archived ? "text-zinc-500" : "font-semibold underline"}>Aktywne</Link>
        <Link href="/habits?view=archived" className={archived ? "font-semibold underline" : "text-zinc-500"}>Zarchiwizowane</Link>
      </div>
      {habits.length === 0 ? (
        <p className="text-sm text-zinc-500">{archived ? "Brak zarchiwizowanych nawyków." : "Brak nawyków. Dodaj pierwszy."}</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {habits.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-0">
                <p className="font-medium">{h.name}</p>
                <p className="text-sm text-zinc-500">
                  {HABIT_TYPE_LABELS[h.habit_type]}
                  {h.target_value != null && ` · cel ${h.target_value}${h.unit ? ` ${h.unit}` : ""}`}
                  {h.categories && ` · ${h.categories.name}`}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm">
                <Link href={`/habits/${h.id}/edit`} className="underline">Edytuj</Link>
                {archived ? (
                  <form action={activateHabit.bind(null, h.id)}>
                    <button type="submit" className="underline">Przywróć</button>
                  </form>
                ) : (
                  <form action={archiveHabit.bind(null, h.id, h.start_date)}>
                    <button type="submit" className="underline">Archiwizuj</button>
                  </form>
                )}
                <DeleteButton action={deleteHabit.bind(null, h.id)} confirmText={`Usunąć nawyk „${h.name}” razem z jego wpisami? Tej operacji nie można cofnąć.`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function HabitsPage(props: PageProps<"/habits">) {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nawyki</h1>
        <Link href="/habits/new" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">Nowy nawyk</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <HabitList searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
