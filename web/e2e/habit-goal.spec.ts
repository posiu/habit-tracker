import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

const email = `e2e-hgoal-${Date.now()}@rls-test.local`;

test("a goal counts completed days of a habit from the goal's start", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Czytanie");
  await ui().getByLabel("Start").fill(addDays(today, -10));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Czytanie")).toBeVisible();

  // one day before the goal starts, then two days after it
  for (const day of [addDays(today, -5), addDays(today, -1), today]) {
    await page.goto(`/daily/${day}`);
    await ui().getByLabel("Czytanie").check();
    await page.getByRole("button", { name: "Zapisz dzień" }).click();
    await expect(ui().getByText("Zapisano.")).toBeVisible();
  }

  await page.goto("/goals/new");
  await ui().getByLabel("Nazwa").fill("Czytam regularnie");
  await ui().getByLabel("Typ celu").selectOption({ label: "Dni z nawyku" });
  await ui().locator('select[name="habit_id"]').selectOption({ label: "Czytanie" });
  await ui().getByLabel("Liczba ukończonych dni").fill("4");
  await ui().getByLabel("Start").fill(addDays(today, -3));
  await page.getByRole("button", { name: "Zapisz" }).click();

  await expect(ui().getByRole("heading", { name: "Czytam regularnie" })).toBeVisible();
  await expect(ui().getByText("Liczony z nawyku:")).toBeVisible();
  await expect(ui().getByText("2 / 4")).toBeVisible(); // the day before the start is not counted

  await page.goto("/goals/new");
  await ui().getByLabel("Nazwa").fill("Bez nawyku");
  await ui().getByLabel("Typ celu").selectOption({ label: "Seria z nawyku" });
  await ui().locator('input[name="days_target"]').fill("3");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("alert")).toHaveText("Wybierz nawyk");
});
