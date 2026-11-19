import { expect, test } from "@playwright/test";

test("profile names are saved, shown in settings and can be cleared", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const email = `e2e-profile-${Date.now()}@rls-test.local`;

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/ustawienia");
  await page.waitForLoadState("networkidle");
  await expect(ui().getByText(email)).toBeVisible();
  await ui().getByLabel("Imię").fill("Anna");
  await ui().getByLabel("Nazwisko").fill("Kowalska");
  await ui().getByRole("button", { name: "Zapisz profil" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();

  await page.reload();
  await expect(ui().getByLabel("Imię")).toHaveValue("Anna");
  await expect(ui().getByText("Anna Kowalska")).toBeVisible();

  await ui().getByLabel("Imię").fill("");
  await ui().getByLabel("Nazwisko").fill("");
  await ui().getByRole("button", { name: "Zapisz profil" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();
  await page.reload();
  await expect(ui().getByLabel("Imię")).toHaveValue("");
});
