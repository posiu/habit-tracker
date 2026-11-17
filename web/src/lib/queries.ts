import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
};

export type Habit = {
  id: string;
  name: string;
  habit_type: "boolean" | "numeric" | "time" | "count";
  unit: string | null;
  target_value: number | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  reminder_enabled: boolean;
  reminder_days: number[];
  category_id: string | null;
  categories: { name: string; color: string | null } | null;
};

// Ownership is enforced by RLS, so these queries need no user_id filter.
export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,description,is_active")
    .order("position")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,description,is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

const HABIT_COLUMNS =
  "id,name,habit_type,unit,target_value,is_active,start_date,end_date,reminder_enabled,reminder_days,category_id,categories(name,color)";

export async function listHabits(activeOnly: boolean): Promise<Habit[]> {
  const supabase = await createClient();
  let q = supabase.from("habits").select(HABIT_COLUMNS).order("position").order("created_at");
  q = q.eq("is_active", activeOnly);
  const { data, error } = await q.overrideTypes<Habit[], { merge: false }>();
  if (error) throw error;
  return data;
}

export async function getHabit(id: string): Promise<Habit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select(HABIT_COLUMNS)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Habit, { merge: false }>();
  if (error) throw error;
  return data;
}

export type DayHabit = Pick<Habit, "id" | "name" | "habit_type" | "unit" | "target_value" | "start_date" | "end_date">;

export type DayEntry = {
  id: string;
  mood: number | null;
  notes: string | null;
  habit_entries: {
    habit_id: string;
    completed: boolean;
    numeric_value: number | null;
    time_value: number | null;
  }[];
};

export async function getTimeZone(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("time_zone").maybeSingle();
  return data?.time_zone ?? "Europe/Warsaw";
}

/** Habits that apply on the given day (start <= day <= end), regardless of archived state. */
export async function listHabitsForDate(date: string): Promise<DayHabit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,name,habit_type,unit,target_value,start_date,end_date")
    .lte("start_date", date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    .order("position")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function getDayEntry(date: string): Promise<DayEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_entries")
    .select("id,mood,notes,habit_entries(habit_id,completed,numeric_value,time_value)")
    .eq("entry_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

const PAGE = 1000; // PostgREST caps a response at 1000 rows by default

/** All completed habit entries as { habit_id, date }, paginated. */
export async function listCompletions(): Promise<{ habit_id: string; date: string }[]> {
  const supabase = await createClient();
  const out: { habit_id: string; date: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("habit_entries")
      .select("habit_id,daily_entries!inner(entry_date)")
      .eq("completed", true)
      .order("created_at")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const row of data as unknown as { habit_id: string; daily_entries: { entry_date: string } }[]) {
      out.push({ habit_id: row.habit_id, date: row.daily_entries.entry_date });
    }
    if (data.length < PAGE) return out;
  }
}

/** Days with activity for the heatmap (days without any are omitted). */
export async function getHeatmapCounts(from: string, to: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("heatmap", { from_date: from, to_date: to });
  if (error) throw error;
  return Object.fromEntries((data as { entry_date: string; count: number }[]).map((r) => [r.entry_date, r.count]));
}
