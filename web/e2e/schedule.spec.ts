import { expect, test } from "@playwright/test";
import { todayIn } from "../src/lib/domain/entries";
import { WEEKDAYS, weekday } from "../src/lib/domain/schedule";

const email = `e2e-sched-${Date.now()}@rls-test.local`;

test("a habit not scheduled today stays off the dashboard, and a schedule can be required", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const todayLabel = WEEKDAYS.find(([d]) => d === weekday(todayIn("Europe/Warsaw")))![1];

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Nie dzisiaj");
  for (const [, label] of WEEKDAYS) await ui().getByLabel(label, { exact: true }).uncheck();
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Wybierz co najmniej jeden dzień tygodnia")).toBeVisible();

  for (const [, label] of WEEKDAYS) {
    if (label !== todayLabel) await ui().getByLabel(label, { exact: true }).check();
  }
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Nie dzisiaj")).toBeVisible();

  await page.goto("/");
  await expect(ui().getByText("Brak aktywnych nawyków.")).toBeVisible();
  await expect(ui().getByText("0/0")).toBeVisible();
});
