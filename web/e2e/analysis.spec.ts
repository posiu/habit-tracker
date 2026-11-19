import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

const email = `e2e-analysis-${Date.now()}@rls-test.local`;

test("analysis year and month views, and settings", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Spacer");
  await ui().getByLabel("Start").fill(addDays(today, -3));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Spacer")).toBeVisible();

  await page.goto("/");
  await ui().getByRole("button", { name: /Spacer/ }).click();
  await expect(ui().getByRole("button", { name: /Spacer/ })).toHaveText("✓ Zrobione");

  await page.goto("/analiza");
  await expect(ui().getByRole("heading", { name: "Analiza" })).toBeVisible();
  await expect(ui().getByText("Dni z aktywnością").locator("..")).toContainText("1");

  await page.goto("/analiza/miesiac");
  const grid = ui().getByTestId("month-grid");
  await expect(grid.getByRole("link", { name: "Spacer" })).toBeVisible();
  await expect(grid.getByRole("img", { name: `Spacer, ${today}: wykonane` })).toBeVisible();

  await page.goto("/ustawienia");
  await ui().getByLabel(/Strefa czasowa/).selectOption("Europe/London");
  await ui().getByRole("button", { name: "Zapisz strefę" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();

  // theme: choice persists across reloads
  await ui().locator("label", { hasText: "Jasny" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await ui().locator("label", { hasText: "Ciemny" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

