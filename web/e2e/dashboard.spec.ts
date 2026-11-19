import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

const email = `e2e-dash-${Date.now()}@rls-test.local`;

test("dashboard shows today's progress, streaks and heatmap", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const fourDaysAgo = addDays(today, -4);

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();
  await expect(ui().getByText("Brak aktywnych nawyków.")).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Czytanie");
  await ui().getByLabel("Start").fill(addDays(today, -10));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Czytanie")).toBeVisible();

  // log 4 days ago, 2 days ago, yesterday and today (a gap three days ago)
  for (const day of [fourDaysAgo, twoDaysAgo, yesterday, today]) {
    await page.goto(`/daily/${day}`);
    await ui().getByLabel("Czytanie").check();
    await page.getByRole("button", { name: "Zapisz dzień" }).click();
    await expect(ui().getByText("Zapisano.")).toBeVisible();
  }

  await page.goto("/");
  const row = ui().getByTestId("habit-row").filter({ hasText: "Czytanie" });
  await expect(row.getByTestId("streak")).toHaveText("3"); // today, yesterday, two days ago
  await expect(row).toContainText("rekord 3");
  await expect(ui().getByText("1/1")).toBeVisible();
  await expect(ui().getByText("Aktywności w ostatnim roku").locator("..")).toContainText("4");

  // heatmap: today and the logged days are lit, a gap day is not
  const cell = (d: string) => ui().locator(`[data-date="${d}"]`);
  await expect(cell(today)).toHaveAttribute("data-level", "1");
  await expect(cell(fourDaysAgo)).toHaveAttribute("data-level", "1");
  await expect(cell(addDays(today, -3))).toHaveAttribute("data-level", "0");

  // un-logging today keeps the streak alive through yesterday
  await page.goto(`/daily/${today}`);
  await ui().getByLabel("Czytanie").uncheck();
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();
  await page.goto("/");
  await expect(ui().getByTestId("habit-row").filter({ hasText: "Czytanie" }).getByTestId("streak")).toHaveText("2");
  await expect(ui().getByText("0/1")).toBeVisible();

  // one-tap check-in from the dashboard, and undo
  const tile = ui().getByTestId("habit-row").filter({ hasText: "Czytanie" });
  await tile.getByRole("button", { name: /Czytanie/ }).click();
  await expect(tile.getByRole("button", { name: /Czytanie/ })).toHaveText("✓ Zrobione");
  await expect(tile.getByTestId("streak")).toHaveText("3");
  await expect(ui().getByText("1/1")).toBeVisible();
  await tile.getByRole("button", { name: /Czytanie/ }).click();
  await expect(tile.getByRole("button", { name: /Czytanie/ })).toHaveText("Odhacz");
  await expect(ui().getByText("0/1")).toBeVisible();
});

test("quick two-minute check-in counts as done and is marked as minimum", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-min-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Czytanie");
  await ui().getByLabel("Wersja 2-minutowa").fill("1 strona");
  await ui().getByLabel("Start").fill(addDays(today, -3));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Czytanie")).toBeVisible();

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const row = ui().getByTestId("habit-row").filter({ hasText: "Czytanie" });
  await row.getByRole("button", { name: /Tylko 2 min/ }).click();
  await expect(row.getByRole("button", { name: /\(minimum\)/ })).toBeVisible();
  await expect(row.getByTestId("streak")).toHaveText("1");
  await expect(ui().getByText("1/1")).toBeVisible();

  // the full day form saves a regular completion
  await page.goto(`/daily/${today}`);
  await ui().getByLabel("Czytanie").check();
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();
  await page.goto("/");
  await expect(ui().getByTestId("habit-row").filter({ hasText: "Czytanie" }).getByRole("button", { name: /ukończony dziś, kliknij/ })).toBeVisible();
});
