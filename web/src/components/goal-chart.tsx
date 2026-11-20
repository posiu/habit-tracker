import { daysBetween, type GoalSeriesPoint } from "@/lib/domain/goals";

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

/** Running progress of a goal over time (step line) with the target as a dashed line. Server-rendered SVG. */
export function GoalChart({ points, target, unit }: { points: GoalSeriesPoint[]; target: number | null; unit: string }) {
  if (points.length < 2) return null;
  const W = 340;
  const H = 160;
  const left = 8;
  const right = 8;
  const top = 12;
  const base = 132;
  const plotW = W - left - right;
  const plotH = base - top;

  const first = points[0].date;
  const last = points[points.length - 1].date;
  const span = Math.max(1, daysBetween(first, last));
  const lo = Math.min(0, ...points.map((p) => p.value));
  const hi = Math.max(1, target ?? 0, ...points.map((p) => p.value));
  const x = (d: string) => left + (daysBetween(first, d) / span) * plotW;
  const y = (v: number) => base - ((v - lo) / (hi - lo)) * plotH;

  // step line: hold the previous value until the day it changes
  let path = `M${x(points[0].date)},${y(points[0].value)}`;
  for (let i = 1; i < points.length; i++) path += ` H${x(points[i].date)} V${y(points[i].value)}`;

  const now = points[points.length - 1];
  const summary = `Postęp od ${first} do ${last}: ${fmt(now.value)}${unit ? ` ${unit}` : ""}${target != null ? ` z ${fmt(target)}${unit ? ` ${unit}` : ""}` : ""}.`;

  return (
    <figure className="w-full max-w-md rounded-3xl bg-surface p-4" data-testid="goal-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="w-full">
        {target != null && (
          <>
            <line x1={left} x2={W - right} y1={y(target)} y2={y(target)} className="stroke-muted" strokeWidth="1" strokeDasharray="4 4" />
            <text x={W - right} y={y(target) - 4} textAnchor="end" className="fill-muted" fontSize="10">cel {fmt(target)}</text>
          </>
        )}
        <line x1={left} x2={W - right} y1={y(0)} y2={y(0)} className="stroke-line" strokeWidth="0.5" />
        <path d={path} fill="none" className="stroke-ok" strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx={x(now.date)} cy={y(now.value)} r="3" className="fill-ok stroke-surface" strokeWidth="1.5" />
        <text x={left} y={H - 6} className="fill-muted" fontSize="10">{first}</text>
        <text x={W - right} y={H - 6} textAnchor="end" className="fill-muted" fontSize="10">{last}</text>
      </svg>
      <figcaption className="mt-1 text-[11px] text-muted">Postęp w czasie</figcaption>
    </figure>
  );
}
