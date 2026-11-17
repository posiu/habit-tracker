import { describe, expect, it } from "vitest";
import { activatePatch, archivePatch, isHabitCompleted } from "./habits";

describe("isHabitCompleted", () => {
  it("returns false without an entry", () => {
    expect(isHabitCompleted("boolean", null)).toBe(false);
  });
  it("boolean habits use the completed flag only", () => {
    expect(isHabitCompleted("boolean", { completed: true })).toBe(true);
    expect(isHabitCompleted("boolean", { completed: false, numeric_value: 5 })).toBe(false);
  });
  it("numeric and count habits need a positive numeric value", () => {
    expect(isHabitCompleted("numeric", { numeric_value: 0.5 })).toBe(true);
    expect(isHabitCompleted("count", { numeric_value: 0 })).toBe(false);
    expect(isHabitCompleted("count", {})).toBe(false);
  });
  it("time habits need positive time_value", () => {
    expect(isHabitCompleted("time", { time_value: 30 })).toBe(true);
    expect(isHabitCompleted("time", { time_value: 0 })).toBe(false);
  });
});

describe("archive / activate", () => {
  it("ends the habit today", () => {
    expect(archivePatch("2026-01-01", new Date("2026-05-02T10:00:00Z"))).toEqual({
      is_active: false,
      end_date: "2026-05-02",
    });
  });
  it("never sets end_date before start_date", () => {
    expect(archivePatch("2026-06-01", new Date("2026-05-02T10:00:00Z")).end_date).toBe("2026-06-01");
  });
  it("activating clears end_date", () => {
    expect(activatePatch()).toEqual({ is_active: true, end_date: null });
  });
});
