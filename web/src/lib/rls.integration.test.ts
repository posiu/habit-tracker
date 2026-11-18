// Integration test against the LOCAL Supabase stack: `npm run test:db`.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secret = process.env.SUPABASE_SECRET_KEY;

const run = Date.now();
const noPersist = { auth: { persistSession: false, autoRefreshToken: false } };

async function newUser(label: string) {
  const client = createClient(url, key, noPersist);
  const { data, error } = await client.auth.signUp({
    email: `${label}-${run}@rls-test.local`,
    password: "test-password-123",
  });
  if (error || !data.user || !data.session) throw error ?? new Error("signup returned no session");
  return { client, id: data.user.id };
}

describe("row level security", () => {
  let a: { client: SupabaseClient; id: string };
  let b: { client: SupabaseClient; id: string };
  let categoryA: string;
  let habitA: string;

  beforeAll(async () => {
    [a, b] = await Promise.all([newUser("a"), newUser("b")]);
    const cat = await a.client.from("categories").insert({ name: "Zdrowie" }).select("id").single();
    categoryA = cat.data!.id;
    const habit = await a.client
      .from("habits")
      .insert({ name: "Bieganie", category_id: categoryA })
      .select("id")
      .single();
    habitA = habit.data!.id;
  });

  afterAll(async () => {
    if (!secret) return;
    const admin = createClient(url, secret, noPersist);
    await Promise.all([a, b].filter(Boolean).map((u) => admin.auth.admin.deleteUser(u.id)));
  });

  it("creates a profile on sign-up and sets user_id from the session", async () => {
    const profile = await a.client.from("profiles").select("id").single();
    expect(profile.data?.id).toBe(a.id);
    const habit = await a.client.from("habits").select("user_id").eq("id", habitA).single();
    expect(habit.data?.user_id).toBe(a.id);
  });

  it("hides another user's rows", async () => {
    expect((await b.client.from("habits").select("id")).data).toEqual([]);
    expect((await b.client.from("categories").select("id")).data).toEqual([]);
  });

  it("ignores updates and deletes on another user's rows", async () => {
    await b.client.from("habits").update({ name: "hacked" }).eq("id", habitA);
    await b.client.from("habits").delete().eq("id", habitA);
    const still = await a.client.from("habits").select("name").eq("id", habitA).single();
    expect(still.data?.name).toBe("Bieganie");
  });

  it("cannot attach a habit to another user's category", async () => {
    const r = await b.client.from("habits").insert({ name: "Sneaky", category_id: categoryA });
    expect(r.error).not.toBeNull();
  });

  it("cannot move an own habit into another user's category", async () => {
    const own = await b.client.from("habits").insert({ name: "Mine" }).select("id").single();
    const r = await b.client.from("habits").update({ category_id: categoryA }).eq("id", own.data!.id).select();
    expect(r.error !== null || r.data?.length === 0).toBe(true);
  });

  it("cannot anchor a habit to another user's habit", async () => {
    const r = await b.client.from("habits").insert({ name: "Sneaky anchor", anchor_habit_id: habitA });
    expect(r.error).not.toBeNull();
    const ok = await a.client
      .from("habits")
      .insert({ name: "Czytanie", anchor_habit_id: habitA, identity: "Jestem czytelnikiem", plan_text: "21:00", minimum_text: "1 strona" });
    expect(ok.error).toBeNull();
  });

  it("cannot log an entry for another user's habit", async () => {
    const day = await b.client.from("daily_entries").insert({ entry_date: "2026-01-01" }).select("id").single();
    const r = await b.client.from("habit_entries").insert({ daily_entry_id: day.data!.id, habit_id: habitA });
    expect(r.error).not.toBeNull();
  });

  it("enforces unique category names per user only", async () => {
    expect((await a.client.from("categories").insert({ name: "Zdrowie" })).error?.code).toBe("23505");
    expect((await b.client.from("categories").insert({ name: "Zdrowie" })).error).toBeNull();
  });

  describe("save_day", () => {
    const date = "2026-05-04";
    let numericHabit: string;

    const save = (client: SupabaseClient, args: { entries?: unknown[]; clear?: string[]; mood?: number | null }) =>
      client.rpc("save_day", {
        p_date: date,
        p_mood: args.mood ?? null,
        p_notes: "notatka",
        p_entries: args.entries ?? [],
        p_clear: args.clear ?? [],
      });

    beforeAll(async () => {
      const h = await a.client.from("habits").insert({ name: "Woda", habit_type: "numeric" }).select("id").single();
      numericHabit = h.data!.id;
    });

    it("creates the day with entries, then updates instead of duplicating", async () => {
      const entry = (v: number) => ({ habit_id: numericHabit, completed: true, boolean_value: null, numeric_value: v, time_value: null });

      expect((await save(a.client, { entries: [entry(2)], mood: 4 })).error).toBeNull();
      expect((await save(a.client, { entries: [entry(3)], mood: 5 })).error).toBeNull();

      const days = await a.client.from("daily_entries").select("mood,notes,habit_entries(numeric_value)").eq("entry_date", date);
      expect(days.data).toHaveLength(1);
      expect(days.data![0]).toMatchObject({ mood: 5, notes: "notatka" });
      expect(days.data![0].habit_entries).toEqual([{ numeric_value: 3 }]);
    });

    it("removes an entry when its habit is in the clear list", async () => {
      await save(a.client, { clear: [numericHabit] });
      const days = await a.client.from("daily_entries").select("habit_entries(id)").eq("entry_date", date);
      expect(days.data![0].habit_entries).toEqual([]);
    });

    it("rolls back everything when an entry is invalid", async () => {
      const bad = { habit_id: habitA, completed: true, boolean_value: null, numeric_value: 1, time_value: null };
      const r = await save(b.client, { entries: [bad], mood: 3 }); // habitA belongs to user A
      expect(r.error).not.toBeNull();
      const days = await b.client.from("daily_entries").select("id").eq("entry_date", date);
      expect(days.data).toEqual([]);
    });

    it("does not let another user see or change the day", async () => {
      expect((await b.client.from("daily_entries").select("id").eq("entry_date", date)).data).toEqual([]);
    });
  });

  describe("goals", () => {
    const saveGoal = (client: SupabaseClient, over: Record<string, unknown> = {}) =>
      client.rpc("save_goal", {
        p_id: null,
        p_name: "Oszczędności",
        p_goal_type: "target_value",
        p_unit: "zł",
        p_category_id: null,
        p_start_date: "2026-01-01",
        p_target_date: null,
        p_target_value: 1000,
        p_days_target: null,
        ...over,
      });

    it("creates a goal together with its metric targets", async () => {
      const id = (await saveGoal(a.client)).data as string;
      const row = await a.client.from("goals").select("name,goal_metrics(target_value,days_doing_target)").eq("id", id).single();
      expect(row.data).toMatchObject({ name: "Oszczędności", goal_metrics: { target_value: 1000, days_doing_target: null } });
    });

    it("keeps only the targets relevant for the new type on update", async () => {
      const id = (await saveGoal(a.client)).data as string;
      await saveGoal(a.client, { p_id: id, p_goal_type: "days_doing", p_target_value: null, p_days_target: 21 });
      const row = await a.client.from("goal_metrics").select("target_value,days_doing_target").eq("goal_id", id).single();
      expect(row.data).toEqual({ target_value: null, days_doing_target: 21 });
    });

    it("rejects another user's goal and category", async () => {
      const id = (await saveGoal(a.client)).data as string;
      expect((await saveGoal(b.client, { p_id: id, p_name: "hacked" })).error).not.toBeNull();
      expect((await saveGoal(b.client, { p_category_id: categoryA })).error).not.toBeNull();
      const still = await a.client.from("goals").select("name").eq("id", id).single();
      expect(still.data?.name).toBe("Oszczędności");
    });

    it("stores goal entries through save_day, updates them and clears them", async () => {
      const id = (await saveGoal(a.client)).data as string;
      const day = "2026-06-01";
      const call = (entries: unknown[], clear: string[]) =>
        a.client.rpc("save_day", { p_date: day, p_mood: null, p_notes: null, p_entries: [], p_clear: [], p_goal_entries: entries, p_goal_clear: clear });

      await call([{ goal_id: id, value: 300, boolean_value: null, is_increment: true }], []);
      await call([{ goal_id: id, value: 120, boolean_value: null, is_increment: false }], []);
      let rows = await a.client.from("goal_entries").select("value,is_increment").eq("goal_id", id);
      expect(rows.data).toEqual([{ value: 120, is_increment: false }]);

      await call([], [id]);
      rows = await a.client.from("goal_entries").select("value,is_increment").eq("goal_id", id);
      expect(rows.data).toEqual([]);
    });

    it("cannot log an entry for another user's goal", async () => {
      const id = (await saveGoal(a.client)).data as string;
      const r = await b.client.rpc("save_day", {
        p_date: "2026-06-02", p_mood: null, p_notes: null, p_entries: [], p_clear: [],
        p_goal_entries: [{ goal_id: id, value: 5, boolean_value: null, is_increment: true }], p_goal_clear: [],
      });
      expect(r.error).not.toBeNull();
    });
  });
});
