export type IdentityVotes = {
  identity: string;
  /** Completed entries across all habits supporting this identity. */
  votes: number;
  /** Votes cast in the last `recentDays` days (ending today). */
  recent: number;
  habits: { id: string; name: string; votes: number }[];
};

const key = (s: string) => s.trim().toLocaleLowerCase("pl");

/**
 * Every completed entry is a "vote" for the identity of its habit (HAB-9).
 * Identities are matched ignoring case and surrounding spaces; several habits can support one identity.
 */
export function identityVotes(
  habits: { id: string; name: string; identity: string | null }[],
  completions: { habit_id: string; date: string }[],
  recentFrom: string,
): IdentityVotes[] {
  const byHabit = new Map<string, { total: number; recent: number }>();
  for (const c of completions) {
    const cur = byHabit.get(c.habit_id) ?? { total: 0, recent: 0 };
    cur.total++;
    if (c.date >= recentFrom) cur.recent++;
    byHabit.set(c.habit_id, cur);
  }

  const groups = new Map<string, IdentityVotes>();
  for (const h of habits) {
    const identity = h.identity?.trim();
    if (!identity) continue;
    const k = key(identity);
    const g = groups.get(k) ?? { identity, votes: 0, recent: 0, habits: [] };
    const v = byHabit.get(h.id) ?? { total: 0, recent: 0 };
    g.votes += v.total;
    g.recent += v.recent;
    g.habits.push({ id: h.id, name: h.name, votes: v.total });
    groups.set(k, g);
  }
  return [...groups.values()].sort((a, b) => b.votes - a.votes || a.identity.localeCompare(b.identity, "pl"));
}
