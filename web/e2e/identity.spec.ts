import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

test("completions count as votes for an identity, across habits", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-identity-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  for (const [name, identity] of [["Czytanie", "Jestem czytelnikiem"], ["Audiobook", "jestem czytelnikiem"]]) {
    await page.goto("/habits/new");
    await ui().getByLabel("Nazwa").fill(name);
    await ui().getByLabel("Kim się staję (tożsamość)").fill(identity);
    await ui().getByLabel("Start").fill(addDays(today, -5));
    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(ui().getByText(name)).toBeVisible();
  }

  // 2 votes yesterday (both habits) + 1 today (Czytanie)
  for (const [day, habits] of [[addDays(today, -1), ["Czytanie", "Audiobook"]], [today, ["Czytanie"]]] as const) {
    await page.goto(`/daily/${day}`);
    for (const h of habits) await ui().getByLabel(h).check();
    await page.getByRole("button", { name: "Zapisz dzień" }).click();
    await expect(ui().getByText("Zapisano.")).toBeVisible();
  }

  await page.goto("/analiza");
  const row = ui().getByTestId("identity-votes");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("3");
  await expect(row).toContainText("Czytanie, Audiobook");

  await page.goto("/habits");
  await ui().getByRole("link", { name: "Czytanie" }).first().click();
  await expect(ui().getByTestId("identity-votes")).toContainText("3");
  await expect(ui().getByTestId("identity-votes")).toContainText("z 2 nawyków");
});
