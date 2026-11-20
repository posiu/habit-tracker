import { describe, expect, it } from "vitest";
import { habitTone } from "./habit-colors";

describe("habitTone", () => {
  it("maps a palette key to theme variables", () => {
    expect(habitTone("h3")).toEqual({ dot: "var(--h3-dot)", bg: "var(--h3-bg)", border: "var(--h3-border)" });
  });
  it("falls back to the default look", () => {
    expect(habitTone(null).dot).toBe("var(--accent)");
    expect(habitTone("nope").bg).toBe("var(--surface)");
  });
});
