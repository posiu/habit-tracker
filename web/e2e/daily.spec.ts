import { expect, test } from "@playwright/test";

const email = `e2e-day-${Date.now()}@rls-test.local`;

test("log a day: habits, mood, notes; persists and validates", async ({ page }) => {
  const ui = () => page.locator("main:visible");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  // two habits: a yes/no one and a numeric one
  for (const [name, type, unit] of [["Medytacja", "boolean", ""], ["Woda", "numeric", "l"]]) {
    await page.goto("/habits/new");
    await ui().getByLabel("Nazwa").fill(name);
    await ui().getByLabel("Typ").selectOption(type);
    if (unit) await ui().getByLabel("Jednostka").fill(unit);
    await ui().getByLabel("Start").fill("2026-01-01");
    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(ui().getByText(name)).toBeVisible();
  }

  // /daily redirects to /daily/<today>
  await page.goto("/daily");
  await expect(page).toHaveURL(/\/daily\/\d{4}-\d{2}-\d{2}$/);
  const todayUrl = page.url();

  // invalid value is rejected and everything typed is kept
  await ui().getByLabel("Medytacja").check();
  await ui().getByLabel("Woda").fill("0");
  await ui().getByLabel("Notatka").fill("Dobry dzień");
  await ui().locator("label", { hasText: "😊 Dobrze" }).click();
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Wartość musi być większa od zera")).toBeVisible();
  await expect(ui().getByLabel("Medytacja")).toBeChecked();
  await expect(ui().getByLabel("Notatka")).toHaveValue("Dobry dzień");
  await expect(ui().getByLabel("😊 Dobrze")).toBeChecked();

  // fix and save
  await ui().getByLabel("Woda").fill("2,5");
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();

  // persists after a full reload
  await page.reload();
  await expect(ui().getByLabel("Medytacja")).toBeChecked();
  await expect(ui().getByLabel("Woda")).toHaveValue("2.5");
  await expect(ui().getByLabel("Notatka")).toHaveValue("Dobry dzień");
  await expect(ui().getByLabel("😊 Dobrze")).toBeChecked();

  // clearing removes the entry
  await ui().getByLabel("Medytacja").uncheck();
  await ui().getByLabel("Woda").fill("");
  await ui().locator("label", { hasText: "Brak" }).click();
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();
  await page.reload();
  await expect(ui().getByLabel("Medytacja")).not.toBeChecked();
  await expect(ui().getByLabel("Woda")).toHaveValue("");

  // navigation: previous day works, next is absent on today, future dates bounce back
  await ui().getByRole("link", { name: "Poprzedni dzień" }).click();
  await expect(page).not.toHaveURL(todayUrl);
  await ui().getByRole("link", { name: "Następny dzień" }).click();
  await expect(page).toHaveURL(todayUrl);
  await expect(ui().getByRole("link", { name: "Następny dzień" })).toHaveCount(0);
  await page.goto("/daily/2999-01-01");
  await expect(page).toHaveURL(todayUrl);
  await page.goto("/daily/not-a-date");
  await expect(page.getByText(/404|nie znaleziono strony|could not be found/i).first()).toBeVisible();
});
