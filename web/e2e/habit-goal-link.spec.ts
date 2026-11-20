import { expect, test } from "@playwright/test";

test("a habit can be linked to an existing goal from its form, and the Today shortcuts work", async ({ page }) => {
  const ui = () => page.locator("main:visible");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-link-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  // Today always offers a way to add a habit and a goal
  await expect(ui().getByRole("link", { name: "+ Nowy nawyk" })).toBeVisible();
  await expect(ui().getByRole("link", { name: "+ Nowy cel" })).toBeVisible();
  await ui().getByRole("link", { name: "+ Nowy nawyk" }).click();
  await expect(ui().getByRole("heading", { name: "Nowy nawyk" })).toBeVisible();
  // with no goals yet the form explains how to get one
  await expect(ui().getByText(/Nie masz jeszcze celów liczonych z nawyku/)).toBeVisible();

  for (const name of ["Czytanie", "Bieganie"]) {
    await page.goto("/habits/new");
    await page.waitForLoadState("networkidle");
    await ui().getByLabel("Nazwa").fill(name);
    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(ui().getByText(name)).toBeVisible();
  }

  // a goal counted from "Czytanie"
  await page.goto("/goals/new");
  await page.waitForLoadState("networkidle");
  await ui().getByLabel("Nazwa").fill("Czytam regularnie");
  await ui().getByLabel("Typ celu").selectOption({ label: "Dni z nawyku" });
  await ui().locator('select[name="habit_id"]').selectOption({ label: "Czytanie" });
  await ui().getByLabel("Liczba ukończonych dni").fill("10");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("link", { name: "Czytanie" })).toBeVisible();

  // from "Bieganie" the goal is listed (currently with Czytanie) and can be moved over
  await page.goto("/habits");
  await ui().getByRole("link", { name: "Bieganie" }).first().locator("xpath=ancestor::li").getByRole("link", { name: "Edytuj" }).click();
  await page.waitForLoadState("networkidle");
  await expect(ui().getByText(/teraz z nawyku: Czytanie/)).toBeVisible();
  await ui().getByRole("checkbox", { name: /Czytam regularnie/ }).check();
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Nawyki" })).toBeVisible();

  await page.goto("/goals");
  await ui().getByRole("link", { name: "Czytam regularnie" }).click();
  await expect(ui().getByRole("link", { name: "Bieganie" })).toBeVisible();

  // unticking it detaches the goal
  await page.goto("/habits");
  await ui().getByRole("link", { name: "Bieganie" }).first().locator("xpath=ancestor::li").getByRole("link", { name: "Edytuj" }).click();
  await page.waitForLoadState("networkidle");
  await ui().getByRole("checkbox", { name: /Czytam regularnie/ }).uncheck();
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Nawyki" })).toBeVisible();
  await page.goto("/goals");
  await ui().getByRole("link", { name: "Czytam regularnie" }).click();
  await expect(ui().getByText("nie wskazano nawyku")).toBeVisible();
});
