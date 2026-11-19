import { describe, expect, it } from "vitest";
import { identityVotes } from "./identity";

const habits = [
  { id: "a", name: "Czytanie", identity: "Jestem czytelnikiem" },
  { id: "b", name: "Audiobook", identity: "  jestem czytelnikiem " },
  { id: "c", name: "Bieg", identity: "Jestem biegaczem" },
  { id: "d", name: "Woda", identity: null },
];

describe("identityVotes", () => {
  it("sums completions of habits sharing an identity, ignoring case and spaces", () => {
    const r = identityVotes(
      habits,
      [
        { habit_id: "a", date: "2026-11-01" },
        { habit_id: "a", date: "2026-11-18" },
        { habit_id: "b", date: "2026-11-19" },
        { habit_id: "c", date: "2026-11-19" },
        { habit_id: "d", date: "2026-11-19" },
      ],
      "2026-11-10",
    );
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ identity: "Jestem czytelnikiem", votes: 3, recent: 2 });
    expect(r[0].habits).toEqual([
      { id: "a", name: "Czytanie", votes: 2 },
      { id: "b", name: "Audiobook", votes: 1 },
    ]);
    expect(r[1]).toMatchObject({ identity: "Jestem biegaczem", votes: 1 });
  });

  it("keeps identities without votes and skips habits without identity", () => {
    const r = identityVotes(habits, [], "2026-11-10");
    expect(r.map((i) => [i.identity, i.votes])).toEqual([["Jestem biegaczem", 0], ["Jestem czytelnikiem", 0]]);
  });
});
