import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Podaj datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Nieprawidłowa data");

export const HABIT_TYPES = ["boolean", "numeric", "time", "count"] as const;
export type HabitType = (typeof HABIT_TYPES)[number];

export const HABIT_TYPE_LABELS: Record<HabitType, string> = {
  boolean: "Tak / nie",
  numeric: "Wartość liczbowa",
  time: "Czas",
  count: "Licznik",
};

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nazwa jest wymagana").max(100, "Maksymalnie 100 znaków"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Kolor w formacie #RRGGBB")
    .optional(),
  icon: z.string().trim().max(50, "Maksymalnie 50 znaków").optional(),
  description: z.string().trim().max(1000, "Maksymalnie 1000 znaków").optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const habitSchema = z
  .object({
    name: z.string().trim().min(1, "Nazwa jest wymagana").max(200, "Maksymalnie 200 znaków"),
    habit_type: z.enum(HABIT_TYPES, { error: "Wybierz typ nawyku" }),
    unit: z.string().trim().max(50, "Maksymalnie 50 znaków").optional(),
    target_value: z.number({ error: "Podaj liczbę" }).positive("Cel musi być większy od zera").optional(),
    category_id: z.uuid("Nieprawidłowa kategoria").optional(),
    start_date: isoDate,
    end_date: isoDate.optional(),
    identity: z.string().trim().max(200, "Maksymalnie 200 znaków").optional(),
    plan_text: z.string().trim().max(300, "Maksymalnie 300 znaków").optional(),
    minimum_text: z.string().trim().max(200, "Maksymalnie 200 znaków").optional(),
    anchor_habit_id: z.uuid("Nieprawidłowy nawyk").optional(),
    schedule_days: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Wybierz co najmniej jeden dzień tygodnia"),
  })
  .refine((h) => !h.end_date || h.end_date >= h.start_date, {
    path: ["end_date"],
    message: "Data końcowa nie może być wcześniejsza niż początkowa",
  });
export type HabitInput = z.infer<typeof habitSchema>;

export const profileSchema = z.object({
  first_name: z.string().trim().max(100, "Maksymalnie 100 znaków"),
  last_name: z.string().trim().max(100, "Maksymalnie 100 znaków"),
});

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    out[key] ??= issue.message;
  }
  return out;
}
