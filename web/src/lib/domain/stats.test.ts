import { describe, expect, it } from "vitest";
import { buildHeatmap, currentStreak, heatLevel, heatmapStart, longestStreak } from "./stats";

const TODAY = "2026-11-17"; // Tuesday

describe("currentStreak", () => {
  it("is 0 without completions", () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });
  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-15", "2026-11-16", "2026-11-17"], TODAY)).toBe(3);
  });
  it("is still alive when the last completion was yesterday", () => {
    expect(currentStreak(["2026-11-15", "2026-11-16"], TODAY)).toBe(2);
  });
  it("is 0 when the last completion is older than yesterday", () => {
    expect(currentStreak(["2026-11-14", "2026-11-15"], TODAY)).toBe(0);
  });
  it("stops at the first gap", () => {
    expect(currentStreak(["2026-11-10", "2026-11-11", "2026-11-16", "2026-11-17"], TODAY)).toBe(2);
  });
  it("ignores duplicates and order", () => {
    expect(currentStreak(["2026-11-17", "2026-11-16", "2026-11-17"], TODAY)).toBe(2);
  });
  it("works across month and year boundaries", () => {
    expect(currentStreak(["2025-12-30", "2025-12-31", "2026-01-01"], "2026-01-01")).toBe(3);
  });
});

describe("longestStreak", () => {
  it("finds the longest run", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-10", "2026-01-11"])).toBe(3);
    expect(longestStreak(["2026-01-01", "2026-01-03"])).toBe(1);
  });
});

describe("heatLevel", () => {
  it("uses the Rails buckets", () => {
    expect([0, 1, 2, 3, 5, 6, 10, 11].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });
});

describe("buildHeatmap", () => {
  const grid = buildHeatmap({ [TODAY]: 3, "2026-11-16": 1 }, TODAY);

  it("has 53 week columns of 7 days, starting on a Monday", () => {
    expect(grid).toHaveLength(53);
    expect(grid.every((c) => c.length === 7)).toBe(true);
    expect(grid[0][0]?.date).toBe(heatmapStart(TODAY));
    expect(new Date(`${grid[0][0]!.date}T00:00:00Z`).getUTCDay()).toBe(1);
  });
  it("puts today in the last column on the right weekday and blanks the future", () => {
    const last = grid.at(-1)!;
    expect(last[1]).toMatchObject({ date: TODAY, count: 3, level: 2 });
    expect(last[0]).toMatchObject({ date: "2026-11-16", count: 1, level: 1 });
    expect(last.slice(2)).toEqual([null, null, null, null, null]);
  });
  it("covers a full year back", () => {
    const first = grid[0][0]!.date;
    expect(first <= "2025-11-18").toBe(true);
  });
});
