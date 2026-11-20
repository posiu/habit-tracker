export const HABIT_COLORS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

export const HABIT_COLOR_LABELS: Record<HabitColor, string> = {
  h1: "Pomarańczowy",
  h2: "Niebieski",
  h3: "Fioletowy",
  h4: "Różowy",
  h5: "Zielony",
  h6: "Żółty",
};

export type HabitTone = { dot: string; bg: string; border: string };

/** Theme-aware colors for a habit; null/unknown gives the single default look. */
export function habitTone(color: string | null | undefined): HabitTone {
  if (color && (HABIT_COLORS as readonly string[]).includes(color)) {
    return { dot: `var(--${color}-dot)`, bg: `var(--${color}-bg)`, border: `var(--${color}-border)` };
  }
  return { dot: "var(--accent)", bg: "var(--surface)", border: "var(--line)" };
}
