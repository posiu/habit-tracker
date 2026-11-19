import type { HeatCell } from "@/lib/domain/stats";

const LEVEL_CLASS = [
  "bg-foreground/10",
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
  "bg-heat-4",
] as const;

const DAY_LABELS = ["Pn", "", "Śr", "", "Pt", "", "Nd"];

// "aktywność" has the same plural form ("aktywności") for every number except 1.
function activityLabel(n: number): string {
  return n === 1 ? "1 aktywność" : `${n} aktywności`;
}

export function Heatmap({ weeks, total }: { weeks: HeatCell[][]; total: number }) {
  return (
    <figure className="space-y-2">
      {/* rtl scroll container starts at the right edge, so the newest weeks are visible on narrow screens */}
      <div className="overflow-x-auto pb-2 [direction:rtl]">
        <div role="img" aria-label={`Mapa aktywności z ostatniego roku, łącznie ${total}`} className="flex w-max gap-1 [direction:ltr]">
          <div className="flex flex-col gap-1 pr-1 text-[10px] leading-3 text-muted" aria-hidden>
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="h-3">
                {label}
              </span>
            ))}
          </div>
          {weeks.map((column, w) => (
            <div key={w} className="flex flex-col gap-1">
              {column.map((cell, d) =>
                cell ? (
                  <span
                    key={d}
                    data-date={cell.date}
                    data-level={cell.level}
                    title={`${cell.date}: ${cell.count === 0 ? "brak aktywności" : activityLabel(cell.count)}`}
                    className={`size-3 rounded-sm ${LEVEL_CLASS[cell.level]}`}
                  />
                ) : (
                  <span key={d} className="size-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="flex items-center gap-1 text-xs text-muted">
        Mniej
        {LEVEL_CLASS.map((c, i) => (
          <span key={i} className={`size-3 rounded-sm ${c}`} />
        ))}
        Więcej
      </figcaption>
    </figure>
  );
}
