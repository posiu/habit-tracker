import { describe, expect, it } from "vitest";
import { averageMood, csvField, periodReport, toCsv, weekStart, type ReportHabit } from "./reports";

const habit = (over: Partial<ReportHabit> = {}): ReportHabit => ({
  id: "h1",
  name: "Bieg",
  start_date: "2026-11-01",
  end_date: null,
  schedules: [],
  done: new Set(),
  ...over,
});

describe("periodReport", () => {
  it("counts only due days up to today", () => {
    const h = habit({ done: new Set(["2026-11-16", "2026-11-17"]) });
    const r = periodReport([h], "2026-11-16", "2026-11-22", "2026-11-18");
    expect(r.due).toBe(3); // 16, 17, 18; the rest is in the future
    expect(r.hit).toBe(2);
    expect(r.pct).toBe(67);
    expect(r.days.find((d) => d.date === "2026-11-20")?.pct).toBeNull();
  });

  it("skips unscheduled days and ignores bonus entries there", () => {
    // Mon 16 .. Sun 22; weekdays only, a bonus on Saturday
    const h = habit({ schedules: [{ effective_from: "2026-11-01", days: [1, 2, 3, 4, 5] }], done: new Set(["2026-11-16", "2026-11-21"]) });
    const r = periodReport([h], "2026-11-16", "2026-11-22", "2026-11-22");
    expect(r.due).toBe(5);
    expect(r.hit).toBe(1);
  });

  it("does not count days before the start or after the end", () => {
    const h = habit({ start_date: "2026-11-18", end_date: "2026-11-19" });
    expect(periodReport([h], "2026-11-16", "2026-11-22", "2026-11-22").due).toBe(2);
  });

  it("reports per habit and null percentage when nothing was due", () => {
    const r = periodReport([habit({ start_date: "2027-01-01" })], "2026-11-16", "2026-11-22", "2026-11-22");
    expect(r.pct).toBeNull();
    expect(r.perHabit[0].pct).toBeNull();
  });
});

describe("helpers", () => {
  it("finds the Monday of a week", () => {
    expect(weekStart("2026-11-19")).toBe("2026-11-16");
    expect(weekStart("2026-11-22")).toBe("2026-11-16");
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });

  it("averages moods ignoring empty days", () => {
    expect(averageMood([5, null, 3])).toBe(4);
    expect(averageMood([null])).toBeNull();
  });
});

describe("csv", () => {
  it("quotes separators, quotes and newlines", () => {
    expect(csvField('a,"b"')).toBe('"a,""b"""');
    expect(csvField("line\nbreak")).toBe('"line\nbreak"');
    expect(csvField(null)).toBe("");
    expect(csvField(1.5)).toBe("1.5");
  });

  it("neutralizes spreadsheet formulas but keeps negative numbers", () => {
    expect(csvField("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvField("@cmd")).toBe("'@cmd");
    expect(csvField(-3)).toBe("-3");
  });

  it("joins rows with CRLF", () => {
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe("a,b\r\n1,x\r\n");
  });
});
