import { describe, expect, it } from "vitest";
import { addDays, buildHabitEntry, dailySchema, habitActiveOn, isValidDate, todayIn } from "./entries";

describe("buildHabitEntry", () => {
  it("boolean: checked sets, unchecked clears", () => {
    expect(buildHabitEntry("boolean", "on")).toEqual({
      kind: "set",
      values: { completed: true, boolean_value: true, numeric_value: null, time_value: null },
    });
    expect(buildHabitEntry("boolean", null)).toEqual({ kind: "clear" });
  });

  it("numeric and count store numeric_value, accept comma decimals", () => {
    expect(buildHabitEntry("numeric", "5,5")).toMatchObject({ kind: "set", values: { numeric_value: 5.5, completed: true } });
    expect(buildHabitEntry("count", "3")).toMatchObject({ kind: "set", values: { numeric_value: 3 } });
  });

  it("time stores whole minutes in time_value", () => {
    expect(buildHabitEntry("time", "45")).toMatchObject({ kind: "set", values: { time_value: 45, numeric_value: null } });
    expect(buildHabitEntry("time", "1.5").kind).toBe("error");
  });

  it("empty input clears, zero/negative/garbage are errors", () => {
    expect(buildHabitEntry("numeric", "  ")).toEqual({ kind: "clear" });
    expect(buildHabitEntry("numeric", "0").kind).toBe("error");
    expect(buildHabitEntry("count", "-2").kind).toBe("error");
    expect(buildHabitEntry("numeric", "abc").kind).toBe("error");
  });
});

describe("dailySchema", () => {
  it("accepts mood 1..5 and optional fields", () => {
    expect(dailySchema.safeParse({}).success).toBe(true);
    expect(dailySchema.safeParse({ mood: 5 }).success).toBe(true);
    expect(dailySchema.safeParse({ mood: 0 }).success).toBe(false);
    expect(dailySchema.safeParse({ mood: 6 }).success).toBe(false);
    expect(dailySchema.safeParse({ notes: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("dates", () => {
  it("validates calendar dates", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("26-02-01")).toBe(false);
  });
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
  it("computes today in a time zone", () => {
    const now = new Date("2026-11-17T23:30:00Z");
    expect(todayIn("UTC", now)).toBe("2026-11-17");
    expect(todayIn("Europe/Warsaw", now)).toBe("2026-11-18");
    expect(todayIn("Not/AZone", now)).toBe("2026-11-17");
  });
  it("habitActiveOn respects the start/end range", () => {
    const h = { start_date: "2026-03-01", end_date: "2026-03-31" };
    expect(habitActiveOn(h, "2026-02-28")).toBe(false);
    expect(habitActiveOn(h, "2026-03-01")).toBe(true);
    expect(habitActiveOn(h, "2026-03-31")).toBe(true);
    expect(habitActiveOn(h, "2026-04-01")).toBe(false);
    expect(habitActiveOn({ start_date: "2026-03-01", end_date: null }, "2030-01-01")).toBe(true);
  });
});
