import { expect, test } from "@playwright/test";

test("settings sub-pages and forms have a way back", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-nav-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  // Ustawienia → Kategorie → Nowa kategoria, each with a back link to its parent
  await page.goto("/ustawienia");
  await ui().getByRole("link", { name: "Kategorie" }).click();
  await expect(ui().getByRole("heading", { name: "Kategorie" })).toBeVisible();
  await ui().getByRole("link", { name: "Nowa kategoria" }).click();
  await ui().getByRole("link", { name: /Kategorie/ }).first().click();
  await expect(ui().getByRole("heading", { name: "Kategorie" })).toBeVisible();
  await ui().getByRole("link", { name: /Ustawienia/ }).first().click();
  await expect(ui().getByRole("heading", { name: "Ustawienia" })).toBeVisible();

  // goals live next to habits: Nawyki tab → Cele → new goal → back to the list
  await page.getByRole("navigation", { name: "Główna nawigacja" }).getByRole("link", { name: "Nawyki" }).click();
  await ui().getByRole("navigation", { name: "Nawyki i cele" }).getByRole("link", { name: "Cele" }).click();
  await expect(ui().getByRole("heading", { name: "Cele" })).toBeVisible();
  await ui().getByRole("link", { name: "Nowy cel" }).click();
  await expect(ui().getByRole("heading", { name: "Nowy cel" })).toBeVisible();
  await ui().getByRole("link", { name: "Cele", exact: true }).click();
  await expect(ui().getByRole("heading", { name: "Cele" })).toBeVisible();

  // habits form and day screen
  await page.goto("/habits/new");
  await ui().getByRole("link", { name: /Nawyki/ }).first().click();
  await expect(ui().getByRole("heading", { name: "Nawyki" })).toBeVisible();
  await page.goto("/daily");
  await ui().getByRole("link", { name: /Dziś/ }).first().click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();
});
