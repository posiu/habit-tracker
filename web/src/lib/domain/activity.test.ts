import { describe, expect, it } from "vitest";
import { activityStatus, daysAgo, lastMovement } from "./activity";

const now = new Date("2026-11-20T12:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000);

describe("activityStatus", () => {
  it("is active up to 7 days of silence", () => {
    expect(activityStatus(ago(0), now)).toBe("active");
    expect(activityStatus(ago(7), now)).toBe("active");
  });
  it("is fading between 8 and 14 days", () => {
    expect(activityStatus(ago(8), now)).toBe("fading");
    expect(activityStatus(ago(14), now)).toBe("fading");
  });
  it("is inactive after more than 14 days or without any activity", () => {
    expect(activityStatus(ago(15), now)).toBe("inactive");
    expect(activityStatus(null, now)).toBe("inactive");
  });
});

describe("lastMovement", () => {
  it("takes the later of data write and sign-in", () => {
    expect(lastMovement("2026-11-10T00:00:00Z", "2026-11-18T00:00:00Z")?.toISOString()).toBe("2026-11-18T00:00:00.000Z");
    expect(lastMovement("2026-11-10T00:00:00Z", null)?.toISOString()).toBe("2026-11-10T00:00:00.000Z");
  });
  it("is null when there is neither", () => {
    expect(lastMovement(null, undefined)).toBeNull();
  });
});

describe("daysAgo", () => {
  it("counts whole days and never goes negative", () => {
    expect(daysAgo(ago(3.5), now)).toBe(3);
    expect(daysAgo(new Date(now.getTime() + 1000), now)).toBe(0);
  });
});
