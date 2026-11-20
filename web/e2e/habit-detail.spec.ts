import { expect, test } from "@playwright/test";
import { todayIn } from "../src/lib/domain/entries";

test("days of the current week before a new habit's start are not shown as missed", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-detail-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await page.waitForLoadState("networkidle");
  await ui().getByLabel("Nazwa").fill("Rozciąganie");
  await ui().getByLabel("Start").fill(today);
  await page.getByRole("button", { name: "Zapisz" }).click();
  await ui().getByRole("link", { name: "Rozciąganie" }).click();

  const week = ui().getByRole("region", { name: "Ten tydzień" });
  // only today (the start day) is a due, not-yet-done day; earlier days of the week predate the habit
  await expect(week.locator('[aria-label*="niewykonane"]')).toHaveCount(1);
  const isMonday = new Date(`${today}T00:00:00Z`).getUTCDay() === 1;
  if (!isMonday) await expect(week.locator('[aria-label*="przed startem nawyku"]').first()).toBeVisible();
});
