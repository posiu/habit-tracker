import { describe, expect, it } from "vitest";
import { categorySchema, habitSchema, fieldErrors } from "./schemas";
import { habitFromForm, categoryFromForm } from "./form-data";

const validHabit = {
  name: "Bieganie",
  habit_type: "numeric",
  start_date: "2026-01-10",
  schedule_days: [0, 1, 2, 3, 4, 5, 6],
};

describe("habitSchema", () => {
  it("accepts a minimal valid habit", () => {
    expect(habitSchema.safeParse(validHabit).success).toBe(true);
  });

  it("requires at least one scheduled weekday", () => {
    expect(habitSchema.safeParse({ ...validHabit, schedule_days: [] }).success).toBe(false);
  });

  it("rejects empty and too long names", () => {
    expect(habitSchema.safeParse({ ...validHabit, name: "  " }).success).toBe(false);
    expect(habitSchema.safeParse({ ...validHabit, name: "x".repeat(201) }).success).toBe(false);
  });

  it("requires a positive target value", () => {
    expect(habitSchema.safeParse({ ...validHabit, target_value: 0 }).success).toBe(false);
    expect(habitSchema.safeParse({ ...validHabit, target_value: -1 }).success).toBe(false);
    expect(habitSchema.safeParse({ ...validHabit, target_value: 2.5 }).success).toBe(true);
  });

  it("rejects end date before start date and reports it on end_date", () => {
    const r = habitSchema.safeParse({ ...validHabit, end_date: "2026-01-09" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).end_date).toMatch(/wcześniejsza/);
    expect(habitSchema.safeParse({ ...validHabit, end_date: "2026-01-10" }).success).toBe(true);
  });

  it("rejects unknown habit types, bad weekdays and an empty schedule", () => {
    expect(habitSchema.safeParse({ ...validHabit, habit_type: "weird" }).success).toBe(false);
    expect(habitSchema.safeParse({ ...validHabit, schedule_days: [7] }).success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("trims the name and validates color format", () => {
    const r = categorySchema.parse({ name: "  Zdrowie  ", color: "#10B981" });
    expect(r.name).toBe("Zdrowie");
    expect(categorySchema.safeParse({ name: "X", color: "green" }).success).toBe(false);
  });
});

describe("form parsing", () => {
  it("maps empty strings to undefined and checkboxes to booleans", () => {
    const fd = new FormData();
    fd.set("name", "Woda");
    fd.set("habit_type", "count");
    fd.set("unit", "");
    fd.set("target_value", "2,5");
    fd.set("start_date", "2026-03-01");
    fd.append("schedule_days", "1");
    fd.append("schedule_days", "3");
    const parsed = habitSchema.parse(habitFromForm(fd));
    expect(parsed.unit).toBeUndefined();
    expect(parsed.target_value).toBe(2.5);
    expect(parsed.schedule_days).toEqual([1, 3]);
  });

  it("flags a non-numeric target value", () => {
    const fd = new FormData();
    fd.set("name", "Woda");
    fd.set("habit_type", "count");
    fd.set("target_value", "abc");
    fd.set("start_date", "2026-03-01");
    const r = habitSchema.safeParse(habitFromForm(fd));
    expect(r.success).toBe(false);
  });

  it("builds category input", () => {
    const fd = new FormData();
    fd.set("name", "Sport");
    expect(categorySchema.parse(categoryFromForm(fd)).name).toBe("Sport");
  });
});

import { rawValues } from "./form-data";

describe("rawValues", () => {
  it("echoes submitted fields, keeping schedule_days as an array", () => {
    const fd = new FormData();
    fd.set("name", "Woda");
    fd.set("$ACTION_ID_abc", "x");
    fd.append("schedule_days", "1");
    fd.append("schedule_days", "5");
    expect(rawValues(fd)).toEqual({ name: "Woda", schedule_days: ["1", "5"] });
  });
});
