export type ActivityStatus = "active" | "fading" | "inactive";

export const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  active: "Aktywne",
  fading: "Mało aktywne",
  inactive: "Nieaktywne",
};

const DAY = 86_400_000;

/**
 * Account activity: "active" = something happened in the last 7 days, "inactive" = nothing for more than
 * 14 days (or ever), "fading" = in between (8-14 days of silence).
 */
export function activityStatus(lastActivity: Date | null, now: Date): ActivityStatus {
  if (!lastActivity) return "inactive";
  const age = now.getTime() - lastActivity.getTime();
  if (age <= 7 * DAY) return "active";
  if (age <= 14 * DAY) return "fading";
  return "inactive";
}

/** The later of the last data write and the last password sign-in (either counts as "movement"). */
export function lastMovement(lastWrite: string | null | undefined, lastSignIn: string | null | undefined): Date | null {
  const times = [lastWrite, lastSignIn].filter((t): t is string => !!t).map((t) => Date.parse(t));
  return times.length ? new Date(Math.max(...times)) : null;
}

export function daysAgo(date: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY));
}
