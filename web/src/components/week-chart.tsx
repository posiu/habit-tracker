import type { DayReport } from "@/lib/domain/reports";

const LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

/** Completion per day (bars, 0-100%) with the mood line (1-5) on top. Server-rendered SVG. */
export function WeekChart({ days, moods }: { days: DayReport[]; moods: (number | null)[] }) {
  const W = 322;
  const H = 150;
  const base = 120; // bottom of the plot
  const plot = 100;
  const step = W / 7;
  const bx = (i: number) => i * step + step / 2;
  const my = (m: number) => base - ((m - 1) / 4) * plot;
  const points = moods.map((m, i) => (m == null ? null : { x: bx(i), y: my(m) }));
  const line = points.filter((p): p is { x: number; y: number } => p !== null).map((p) => `${p.x},${p.y}`).join(" ");

  const summary = days
    .map((d, i) => `${LABELS[i]}: ${d.pct === null ? "brak nawyków" : `${d.pct}%`}${moods[i] != null ? `, nastrój ${moods[i]}` : ""}`)
    .join("; ");

  return (
    <figure className="rounded-3xl bg-surface p-4">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Wykres tygodnia. ${summary}`} className="w-full">
        {[0, 50, 100].map((g) => (
          <line key={g} x1="0" x2={W} y1={base - (g / 100) * plot} y2={base - (g / 100) * plot} className="stroke-line" strokeWidth="0.5" strokeDasharray="3 3" />
        ))}
        {days.map((d, i) => (
          <g key={d.date}>
            <rect x={bx(i) - 12} y={base - ((d.pct ?? 0) / 100) * plot} width="24" height={((d.pct ?? 0) / 100) * plot} rx="5" className="fill-ok" opacity={d.pct === null ? 0 : 0.85} />
            <text x={bx(i)} y={H - 12} textAnchor="middle" className="fill-muted" fontSize="11">{LABELS[i]}</text>
          </g>
        ))}
        {line && <polyline points={line} fill="none" className="stroke-foreground" strokeWidth="2" strokeLinejoin="round" />}
        {points.map((p, i) => p && <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-foreground stroke-surface" strokeWidth="2" />)}
      </svg>
      <figcaption className="mt-2 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ok" /> ukończone nawyki</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-foreground" /> nastrój (1–5)</span>
      </figcaption>
    </figure>
  );
}
