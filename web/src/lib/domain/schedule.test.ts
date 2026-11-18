import { describe, expect, it } from "vitest";
import { isScheduledOn, sameDays, scheduleOn, weekday } from "./schedule";
import { currentStreak, longestStreak } from "./stats";

// 2026-11-16 is a Monday
const mon = "2026-11-16";

describe("schedule", () => {
  it("computes weekdays with 0 = Sunday", () => {
    expect(weekday(mon)).toBe(1);
    expect(weekday("2026-11-22")).toBe(0);
  });

  it("treats a habit without schedules as daily", () => {
    expect(isScheduledOn([], mon)).toBe(true);
  });

  it("judges each day by the schedule that applied then", () => {
    const schedules = [
      { effective_from: "2026-11-01", days: [1, 2, 3, 4, 5] },
      { effective_from: "2026-11-16", days: [6, 0] },
    ];
    expect(scheduleOn(schedules, "2026-11-10")?.days).toEqual([1, 2, 3, 4, 5]);
    expect(isScheduledOn(schedules, "2026-11-12")).toBe(true); // Thursday, old schedule
    expect(isScheduledOn(schedules, "2026-11-19")).toBe(false); // Thursday, new schedule
    expect(isScheduledOn(schedules, "2026-11-21")).toBe(true); // Saturday, new schedule
  });

  it("compares day sets regardless of order", () => {
    expect(sameDays([1, 3], [3, 1])).toBe(true);
    expect(sameDays([1], [1, 2])).toBe(false);
  });
});

describe("streaks with a schedule", () => {
  const weekdaysOnly = (d: string) => ![0, 6].includes(weekday(d));

  it("skips unscheduled days instead of breaking the streak", () => {
    // Mon 16, Fri 13, Thu 12, Wed 11 done; weekend skipped
    const done = ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-16"];
    expect(currentStreak(done, "2026-11-16", weekdaysOnly)).toBe(4);
    expect(longestStreak(done, weekdaysOnly)).toBe(4);
  });

  it("does not break on a scheduled day that is not done yet today", () => {
    const done = ["2026-11-12", "2026-11-13"];
    expect(currentStreak(done, "2026-11-16", weekdaysOnly)).toBe(2);
  });

  it("breaks on a missed scheduled day", () => {
    const done = ["2026-11-11", "2026-11-13", "2026-11-16"];
    expect(currentStreak(done, "2026-11-16", weekdaysOnly)).toBe(2);
    expect(longestStreak(done, weekdaysOnly)).toBe(2);
  });

  it("ignores a bonus entry on an unscheduled day", () => {
    const done = ["2026-11-13", "2026-11-14", "2026-11-16"]; // Sat 14 is a bonus
    expect(currentStreak(done, "2026-11-16", weekdaysOnly)).toBe(2);
  });

  it("is alive when today is unscheduled and the last scheduled day was done", () => {
    expect(currentStreak(["2026-11-12", "2026-11-13"], "2026-11-14", weekdaysOnly)).toBe(2);
  });
});
