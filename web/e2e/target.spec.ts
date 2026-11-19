import { expect, test } from "@playwright/test";
import { todayIn } from "../src/lib/domain/entries";

const email = `e2e-target-${Date.now()}@rls-test.local`;

test("a numeric habit is completed only when it reaches its target", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("Bieg");
  await ui().getByLabel("Typ").selectOption({ label: "Wartość liczbowa" });
  await ui().getByLabel("Cel", { exact: true }).fill("2");
  await ui().getByLabel("Jednostka").fill("km");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Bieg")).toBeVisible();

  const save = async (value: string) => {
    await page.goto(`/daily/${today}`);
    await ui().getByRole("textbox", { name: /Bieg/ }).fill(value);
    await page.getByRole("button", { name: "Zapisz dzień" }).click();
    await expect(ui().getByText("Zapisano.")).toBeVisible();
  };

  await save("1,5");
  await page.goto("/");
  await expect(ui().getByText("0/1")).toBeVisible();
  await page.goto(`/daily/${today}`);
  await expect(ui().getByText("Poniżej celu")).toBeVisible();

  await save("2");
  await page.goto("/");
  await expect(ui().getByText("1/1")).toBeVisible();
  await page.goto(`/daily/${today}`);
  await expect(ui().getByText("✓ Cel osiągnięty")).toBeVisible();
});
