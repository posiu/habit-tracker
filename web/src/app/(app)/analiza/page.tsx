import { Suspense } from "react";
import { AnalysisTabs } from "@/components/analysis-tabs";
import { Heatmap } from "@/components/heatmap";
import { todayIn } from "@/lib/domain/entries";
import { buildHeatmap, heatmapStart } from "@/lib/domain/stats";
import { getHeatmapCounts, getTimeZone, listDailyEntries } from "@/lib/queries";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint && <p className="text-xs text-soft">{hint}</p>}
    </div>
  );
}

async function Year() {
  const today = todayIn(await getTimeZone());
  const start = heatmapStart(today);
  const [counts, entries] = await Promise.all([getHeatmapCounts(start, today), listDailyEntries(start, today)]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(counts).filter((c) => c > 0).length;
  const moods = entries.map((e) => e.mood).filter((m): m is number => m != null);
  const avg = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1).replace(".", ",") : "–";

  return (
    <>
      <section className="rounded-3xl bg-surface p-4">
        <p className="mb-3 text-sm text-muted">Ostatni rok</p>
        <Heatmap weeks={buildHeatmap(counts, today)} total={total} />
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Średni nastrój" value={avg} hint={moods.length ? `z ${moods.length} dni, skala 1–5` : "brak zapisanego nastroju"} />
        <Stat label="Dni z aktywnością" value={String(activeDays)} hint="w ostatnim roku" />
      </div>
      <div className="rounded-3xl bg-surface p-4">
        <p className="text-xs text-muted">Ukończone nawyki w ostatnim roku</p>
        <p className="mt-1 text-3xl font-bold">{total}</p>
      </div>
    </>
  );
}

export default function AnalysisPage() {
  return (
    <main className="space-y-4">
      <AnalysisTabs active="year" />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Year />
      </Suspense>
    </main>
  );
}
