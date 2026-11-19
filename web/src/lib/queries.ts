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
  identity: string | null;
  plan_text: string | null;
  minimum_text: string | null;
  anchor_habit_id: string | null;
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
  "id,name,habit_type,unit,target_value,is_active,start_date,end_date,identity,plan_text,minimum_text,anchor_habit_id,category_id,categories(name,color)";

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

export type DayHabit = Pick<Habit, "id" | "name" | "habit_type" | "unit" | "target_value" | "start_date" | "end_date" | "plan_text">;

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
    .select("id,name,habit_type,unit,target_value,start_date,end_date,plan_text")
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
export async function listCompletions(habitId?: string): Promise<{ habit_id: string; date: string }[]> {
  const supabase = await createClient();
  const out: { habit_id: string; date: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = supabase
      .from("habit_entries")
      .select("habit_id,daily_entries!inner(entry_date)")
      .eq("completed", true);
    if (habitId) query = query.eq("habit_id", habitId);
    const { data, error } = await query.order("created_at").range(from, from + PAGE - 1);
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

// ---- goals ----------------------------------------------------------------

export type Goal = {
  id: string;
  name: string;
  goal_type: import("@/lib/domain/goals").GoalType;
  unit: string | null;
  start_date: string;
  target_date: string | null;
  is_active: boolean;
  completed_at: string | null;
  category_id: string | null;
  categories: { name: string; color: string | null } | null;
  goal_metrics: {
    target_value: number | null;
    days_doing_target: number | null;
    days_without_target: number | null;
  } | null;
};

const GOAL_COLUMNS =
  "id,name,goal_type,unit,start_date,target_date,is_active,completed_at,category_id,categories(name,color),goal_metrics(target_value,days_doing_target,days_without_target)";

export async function listGoals(closed: boolean): Promise<Goal[]> {
  const supabase = await createClient();
  let q = supabase.from("goals").select(GOAL_COLUMNS).order("position").order("created_at");
  q = closed ? q.not("completed_at", "is", null) : q.is("completed_at", null);
  const { data, error } = await q.overrideTypes<Goal[], { merge: false }>();
  if (error) throw error;
  return data;
}

export async function getGoal(id: string): Promise<Goal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Goal, { merge: false }>();
  if (error) throw error;
  return data;
}

export type GoalEntryRow = {
  goal_id: string;
  date: string;
  value: number | null;
  boolean_value: boolean | null;
  is_increment: boolean | null;
};

/** Entries of the given goals (all dates), paginated. */
export async function listGoalEntries(goalIds: string[]): Promise<GoalEntryRow[]> {
  if (goalIds.length === 0) return [];
  const supabase = await createClient();
  const out: GoalEntryRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("goal_entries")
      .select("goal_id,value,boolean_value,is_increment,daily_entries!inner(entry_date)")
      .in("goal_id", goalIds)
      .order("created_at")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data as unknown as (Omit<GoalEntryRow, "date"> & { daily_entries: { entry_date: string } })[]) {
      out.push({ goal_id: r.goal_id, date: r.daily_entries.entry_date, value: r.value, boolean_value: r.boolean_value, is_increment: r.is_increment });
    }
    if (data.length < PAGE) return out;
  }
}

export type DayGoal = Pick<Goal, "id" | "name" | "goal_type" | "unit" | "start_date" | "completed_at"> & {
  goal_metrics: { target_value: number | null } | null;
};

export type DayGoalEntry = { goal_id: string; value: number | null; boolean_value: boolean | null; is_increment: boolean | null };

/** Goals that can be logged on a day (days/value goals open on that date). */
export async function listGoalsForDate(date: string): Promise<DayGoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("id,name,goal_type,unit,start_date,completed_at,goal_metrics(target_value)")
    .in("goal_type", ["days_doing", "days_without", "target_value"])
    .lte("start_date", date)
    .order("position")
    .order("created_at")
    .overrideTypes<DayGoal[], { merge: false }>();
  if (error) throw error;
  return data.filter((g) => !g.completed_at || g.completed_at.slice(0, 10) >= date);
}

export async function getDayGoalEntries(date: string): Promise<DayGoalEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goal_entries")
    .select("goal_id,value,boolean_value,is_increment,daily_entries!inner(entry_date)")
    .eq("daily_entries.entry_date", date);
  if (error) throw error;
  return data as unknown as DayGoalEntry[];
}

export type HabitSchedule = { habit_id: string; effective_from: string; days: number[] };

export async function listSchedules(habitIds?: string[]): Promise<HabitSchedule[]> {
  if (habitIds && habitIds.length === 0) return [];
  const supabase = await createClient();
  let q = supabase.from("habit_schedules").select("habit_id,effective_from,days").order("effective_from");
  if (habitIds) q = q.in("habit_id", habitIds);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
