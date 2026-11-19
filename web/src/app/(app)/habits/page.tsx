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
      <div className="flex gap-2 text-sm font-semibold">
        <Link href="/habits" className={`flex h-11 items-center rounded-full px-4 ${archived ? "bg-surface-2 text-muted" : "bg-chip text-chip-text"}`}>Aktywne</Link>
        <Link href="/habits?view=archived" className={`flex h-11 items-center rounded-full px-4 ${archived ? "bg-chip text-chip-text" : "bg-surface-2 text-muted"}`}>Zarchiwizowane</Link>
      </div>
      {habits.length === 0 ? (
        <p className="text-sm text-muted">{archived ? "Brak zarchiwizowanych nawyków." : "Brak nawyków. Dodaj pierwszy."}</p>
      ) : (
        <ul className="space-y-2">
          {habits.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl bg-surface p-4">
              <div className="min-w-0">
                <Link href={`/habits/${h.id}`} className="text-[17px] font-semibold">{h.name}</Link>
                <p className="text-sm text-muted">
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
        <h1 className="text-[34px] font-bold tracking-tight">Nawyki</h1>
        <Link href="/habits/new" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">Nowy nawyk</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <HabitList searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
