import { describe, expect, it } from "vitest";
import { buildGoalEntry, effectiveValue, goalLoggableOn, goalProgress, goalSchema, goalSeries, type GoalCore, type GoalEntryLite } from "./goals";

const TODAY = "2026-11-17";
const base: GoalCore = {
  goal_type: "target_value",
  start_date: "2026-11-01",
  target_date: null,
  completed_at: null,
  target_value: 1000,
  days_doing_target: null,
  days_without_target: null,
};
const e = (date: string, p: Partial<GoalEntryLite> = {}): GoalEntryLite => ({
  date,
  value: null,
  boolean_value: null,
  is_increment: true,
  ...p,
});

describe("goalSchema", () => {
  const ok = { name: "Oszczędności", goal_type: "target_value", start_date: "2026-11-01", target_value: 500 };
  it("accepts a valid value goal", () => expect(goalSchema.safeParse(ok).success).toBe(true));
  it("requires target_value for value goals", () => {
    expect(goalSchema.safeParse({ ...ok, target_value: undefined }).success).toBe(false);
    expect(goalSchema.safeParse({ ...ok, target_value: 0 }).success).toBe(false);
  });
  it("requires target_date for date goals and not before start", () => {
    const d = { name: "Maraton", goal_type: "target_date", start_date: "2026-11-01" };
    expect(goalSchema.safeParse(d).success).toBe(false);
    expect(goalSchema.safeParse({ ...d, target_date: "2026-10-31" }).success).toBe(false);
    expect(goalSchema.safeParse({ ...d, target_date: "2027-01-01" }).success).toBe(true);
  });
  it("days_target must be a positive integer", () => {
    const d = { name: "Spacer", goal_type: "days_doing", start_date: "2026-11-01" };
    expect(goalSchema.safeParse({ ...d, days_target: 10 }).success).toBe(true);
    expect(goalSchema.safeParse({ ...d, days_target: 2.5 }).success).toBe(false);
    expect(goalSchema.safeParse({ ...d, days_target: 0 }).success).toBe(false);
  });
});

describe("buildGoalEntry", () => {
  it("boolean goals: checked sets, unchecked clears", () => {
    expect(buildGoalEntry("days_doing", "on", null)).toEqual({
      kind: "set",
      values: { value: null, boolean_value: true, is_increment: true },
    });
    expect(buildGoalEntry("days_without", null, null)).toEqual({ kind: "clear" });
  });
  it("value goals: sign from direction, validation", () => {
    expect(buildGoalEntry("target_value", "50,5", "inc")).toMatchObject({ kind: "set", values: { value: 50.5, is_increment: true } });
    expect(buildGoalEntry("target_value", "20", "dec")).toMatchObject({ values: { is_increment: false } });
    expect(buildGoalEntry("target_value", "", "inc")).toEqual({ kind: "clear" });
    expect(buildGoalEntry("target_value", "0", "inc").kind).toBe("error");
    expect(buildGoalEntry("target_value", "x", "inc").kind).toBe("error");
  });
  it("untracked types never store entries", () => {
    expect(buildGoalEntry("target_date", "5", null)).toEqual({ kind: "clear" });
    expect(buildGoalEntry("custom", "on", null)).toEqual({ kind: "clear" });
  });
});

describe("effectiveValue", () => {
  it("subtracts decrements", () => {
    expect(effectiveValue({ value: 30, is_increment: false })).toBe(-30);
    expect(effectiveValue({ value: 30, is_increment: true })).toBe(30);
    expect(effectiveValue({ value: null, is_increment: true })).toBe(0);
  });
});

describe("goalProgress: target_value", () => {
  it("sums increments minus decrements", () => {
    const p = goalProgress(base, [e("2026-11-02", { value: 300 }), e("2026-11-03", { value: 100, is_increment: false }), e("2026-11-05", { value: 150 })], TODAY);
    expect(p).toMatchObject({ current: 350, target: 1000, percentage: 35, status: "in_progress", kind: "value" });
  });
  it("is reached at 100% and capped", () => {
    const p = goalProgress(base, [e("2026-11-02", { value: 1500 })], TODAY);
    expect(p).toMatchObject({ percentage: 100, status: "reached" });
  });
  it("ignores entries before the start date", () => {
    expect(goalProgress(base, [e("2026-10-30", { value: 900 })], TODAY).current).toBe(0);
  });
  it("closed goals are completed regardless of progress", () => {
    expect(goalProgress({ ...base, completed_at: "2026-11-10T10:00:00Z" }, [], TODAY).status).toBe("completed");
  });
  it("not started before the start date", () => {
    expect(goalProgress({ ...base, start_date: "2026-12-01" }, [], TODAY).status).toBe("not_started");
  });
});

describe("goalProgress: days goals", () => {
  const g: GoalCore = { ...base, goal_type: "days_doing", target_value: null, days_doing_target: 10 };
  it("counts only days marked yes", () => {
    const entries = [e("2026-11-02", { boolean_value: true }), e("2026-11-03", { boolean_value: true }), e("2026-11-04", { boolean_value: false })];
    expect(goalProgress(g, entries, TODAY)).toMatchObject({ current: 2, target: 10, percentage: 20, kind: "days" });
  });
  it("falls back to start..target_date inclusive, then to 30", () => {
    expect(goalProgress({ ...g, days_doing_target: null, target_date: "2026-11-20" }, [], TODAY).target).toBe(20);
    expect(goalProgress({ ...g, days_doing_target: null }, [], TODAY).target).toBe(30);
  });
  it("days_without uses its own target", () => {
    const w: GoalCore = { ...g, goal_type: "days_without", days_doing_target: null, days_without_target: 4 };
    const entries = ["02", "03", "04", "05"].map((d) => e(`2026-11-${d}`, { boolean_value: true }));
    expect(goalProgress(w, entries, TODAY)).toMatchObject({ percentage: 100, status: "reached" });
  });
});

describe("goalProgress: target_date and custom", () => {
  const d: GoalCore = { ...base, goal_type: "target_date", target_value: null, start_date: "2026-11-01", target_date: "2026-12-01" };
  it("grows with elapsed time", () => {
    expect(goalProgress(d, [], "2026-11-16")).toMatchObject({ current: 15, target: 30, percentage: 50, status: "in_progress" });
  });
  it("is overdue after the deadline unless closed", () => {
    expect(goalProgress(d, [], "2026-12-05")).toMatchObject({ percentage: 100, status: "overdue" });
    expect(goalProgress({ ...d, completed_at: "2026-12-02T00:00:00Z" }, [], "2026-12-05").status).toBe("completed");
  });
  it("custom goals have no percentage", () => {
    expect(goalProgress({ ...base, goal_type: "custom", target_value: null }, [], TODAY)).toMatchObject({ percentage: null, status: "in_progress" });
  });
  it("value goals past their deadline are overdue", () => {
    expect(goalProgress({ ...base, target_date: "2026-11-10" }, [], TODAY).status).toBe("overdue");
  });
});

describe("goalLoggableOn", () => {
  it("is open from start until the day it was closed", () => {
    const g = { start_date: "2026-11-01", completed_at: "2026-11-10T12:00:00Z" };
    expect(goalLoggableOn(g, "2026-10-31")).toBe(false);
    expect(goalLoggableOn(g, "2026-11-10")).toBe(true);
    expect(goalLoggableOn(g, "2026-11-11")).toBe(false);
    expect(goalLoggableOn({ ...g, completed_at: null }, "2030-01-01")).toBe(true);
  });
});

describe("habit goals (GOAL-2)", () => {
  const core = (type: "habit_days" | "habit_streak", days: number) => ({
    goal_type: type,
    start_date: "2026-11-10",
    target_date: null,
    completed_at: null,
    target_value: null,
    days_doing_target: days,
    days_without_target: null,
  });
  const always = () => true;

  it("habit_days counts completed days since the goal's start only", () => {
    const habit = { dates: ["2026-11-05", "2026-11-09", "2026-11-10", "2026-11-12", "2026-11-13"], scheduled: always };
    const p = goalProgress(core("habit_days", 6), [], "2026-11-15", habit);
    expect(p.current).toBe(3);
    expect(p.target).toBe(6);
    expect(p.percentage).toBe(50);
    expect(p.status).toBe("in_progress");
  });

  it("habit_streak uses the best streak since the start, not the current one", () => {
    const habit = { dates: ["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-14"], scheduled: always };
    const p = goalProgress(core("habit_streak", 3), [], "2026-11-15", habit);
    expect(p.current).toBe(3);
    expect(p.percentage).toBe(100);
    expect(p.status).toBe("reached");
  });

  it("a streak before the start date does not count", () => {
    const habit = { dates: ["2026-11-05", "2026-11-06", "2026-11-07", "2026-11-11"], scheduled: always };
    expect(goalProgress(core("habit_streak", 3), [], "2026-11-15", habit).current).toBe(1);
  });

  it("without habit data progress is zero", () => {
    expect(goalProgress(core("habit_days", 5), [], "2026-11-15").current).toBe(0);
  });
});

describe("goalSeries", () => {
  const core = (over: Partial<Parameters<typeof goalSeries>[0]> = {}) => ({
    goal_type: "target_value" as const,
    start_date: "2026-11-01",
    target_date: null,
    completed_at: null,
    target_value: 100,
    days_doing_target: null,
    days_without_target: null,
    ...over,
  });
  const e = (date: string, value: number, is_increment = true) => ({ date, value, boolean_value: null, is_increment });

  it("sums signed values as a step series from the start to today", () => {
    const s = goalSeries(core(), [e("2026-11-03", 50), e("2026-11-05", 20, false), e("2026-10-01", 999)], "2026-11-07");
    expect(s).toEqual([
      { date: "2026-11-01", value: 0 },
      { date: "2026-11-03", value: 50 },
      { date: "2026-11-05", value: 30 },
      { date: "2026-11-07", value: 30 },
    ]);
  });

  it("ends at the closing day for a closed goal", () => {
    const s = goalSeries(core({ completed_at: "2026-11-04T10:00:00Z" }), [e("2026-11-03", 10), e("2026-11-06", 5)], "2026-11-07");
    expect(s.at(-1)).toEqual({ date: "2026-11-04", value: 10 });
  });

  it("counts yes-days for days goals", () => {
    const yes = (date: string) => ({ date, value: null, boolean_value: true, is_increment: null });
    const no = (date: string) => ({ date, value: null, boolean_value: false, is_increment: null });
    const s = goalSeries(core({ goal_type: "days_doing" }), [yes("2026-11-02"), no("2026-11-03"), yes("2026-11-04")], "2026-11-04");
    expect(s.map((p) => p.value)).toEqual([0, 1, 2]);
  });

  it("follows completed habit days, and the best streak for streak goals", () => {
    const habit = { dates: ["2026-11-02", "2026-11-03", "2026-11-05", "2026-10-20"], scheduled: () => true };
    expect(goalSeries(core({ goal_type: "habit_days" }), [], "2026-11-06", habit).map((p) => p.value)).toEqual([0, 1, 2, 3, 3]);
    expect(goalSeries(core({ goal_type: "habit_streak" }), [], "2026-11-06", habit).map((p) => p.value)).toEqual([0, 1, 2, 2]); // 11-05 does not raise the best streak
  });

  it("has no series for goals without a tracked value or not started yet", () => {
    expect(goalSeries(core({ goal_type: "custom" }), [], "2026-11-07")).toEqual([]);
    expect(goalSeries(core(), [], "2026-10-01")).toEqual([]);
  });
});
