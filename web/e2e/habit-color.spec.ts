import { expect, test } from "@playwright/test";

test("a habit color is chosen in the form and shows on Today and in the habit detail; default stays neutral", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-color-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  for (const [name, color] of [["Domyślny", null], ["Niebieski nawyk", "Niebieski"]] as const) {
    await page.goto("/habits/new");
    await page.waitForLoadState("networkidle");
    await ui().getByLabel("Nazwa").fill(name);
    if (color) await ui().locator("label", { hasText: color }).click();
    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(ui().getByText(name).first()).toBeVisible();
  }

  await page.goto("/");
  const tile = (n: string) => ui().getByTestId("habit-row").filter({ hasText: n });
  await expect(tile("Niebieski nawyk")).toHaveCSS("background-color", /^(?!rgb\(255, 255, 255\)).+/);
  const blue = await tile("Niebieski nawyk").evaluate((el) => getComputedStyle(el).backgroundColor);
  const neutral = await tile("Domyślny").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(blue).not.toBe(neutral);

  // editing keeps the choice selected
  await page.goto("/habits");
  await ui().getByRole("link", { name: "Niebieski nawyk" }).first().locator("xpath=ancestor::li").getByRole("link", { name: "Edytuj" }).click();
  await expect(ui().locator('input[name="color"][value="h2"]')).toBeChecked();
});
