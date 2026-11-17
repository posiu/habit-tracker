import { expect, test } from "@playwright/test";

// Cache Components keep previously visited routes hidden in the DOM, so scope to the visible one.
const email = `e2e-${Date.now()}@rls-test.local`;

test("sign up, manage categories and habits", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  // sign up
  await page.goto("/signup");
  await ui().getByLabel("E-mail").fill(email);
  await ui().getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Pulpit" })).toBeVisible();

  // category: create + duplicate is rejected and input is kept
  await page.goto("/categories/new");
  await ui().getByLabel("Nazwa").fill("Zdrowie");
  await ui().getByLabel("Ikona (np. emoji)").fill("💪");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("💪 Zdrowie")).toBeVisible();

  await page.goto("/categories/new");
  await ui().getByLabel("Nazwa").fill("Zdrowie");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Kategoria o tej nazwie już istnieje")).toBeVisible();
  await expect(ui().getByLabel("Nazwa")).toHaveValue("Zdrowie");

  // habit: validation error keeps everything the user typed
  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Bieganie");
  await ui().getByLabel("Typ").selectOption("numeric");
  await ui().getByLabel("Cel").fill("5,5");
  await ui().getByLabel("Jednostka").fill("km");
  await ui().getByLabel("Start").fill("2026-11-10");
  await ui().getByLabel("Koniec (opcjonalnie)").fill("2026-11-01");
  await ui().getByLabel("Pn").check();
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Data końcowa nie może być wcześniejsza niż początkowa")).toBeVisible();
  await expect(ui().getByLabel("Nazwa")).toHaveValue("Bieganie");
  await expect(ui().getByLabel("Typ")).toHaveValue("numeric");
  await expect(ui().getByLabel("Cel")).toHaveValue("5,5");
  await expect(ui().getByLabel("Pn")).toBeChecked();

  // fix and save, with category
  await ui().getByLabel("Koniec (opcjonalnie)").fill("");
  await ui().getByLabel("Kategoria").selectOption({ label: "💪 Zdrowie" });
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Bieganie")).toBeVisible();
  await expect(ui().getByText("Wartość liczbowa · cel 5.5 km · Zdrowie")).toBeVisible();

  // archive and restore
  await page.getByRole("button", { name: "Archiwizuj" }).click();
  await expect(ui().getByText("Brak nawyków. Dodaj pierwszy.")).toBeVisible();
  await page.getByRole("link", { name: "Zarchiwizowane" }).click();
  await expect(ui().getByText("Bieganie")).toBeVisible();
  await page.getByRole("button", { name: "Przywróć" }).click();
  await page.getByRole("link", { name: "Aktywne" }).click();
  await expect(ui().getByText("Bieganie")).toBeVisible();

  // edit
  await page.getByRole("link", { name: "Edytuj" }).click();
  await expect(ui().getByLabel("Nazwa")).toHaveValue("Bieganie");
  await ui().getByLabel("Nazwa").fill("Bieganie rano");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Bieganie rano")).toBeVisible();

  // delete with confirm dialog
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Usuń" }).click();
  await expect(ui().getByText("Brak nawyków. Dodaj pierwszy.")).toBeVisible();

  // delete category
  await page.goto("/categories");
  await page.getByRole("link", { name: "Edytuj" }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Usuń kategorię" }).click();
  await expect(ui().getByText("Brak kategorii. Dodaj pierwszą.")).toBeVisible();

  // logout
  await page.getByRole("button", { name: "Wyloguj" }).click();
  await expect(page).toHaveURL(/\/login/);
});
