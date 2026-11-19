import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

test("goal detail shows progress over time that follows the logged entries", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-goalchart-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/goals/new");
  await page.waitForLoadState("networkidle");
  await ui().getByLabel("Nazwa").fill("Oszczędności");
  await ui().getByLabel("Typ celu").selectOption("target_value");
  await ui().getByRole("textbox", { name: "Wartość docelowa" }).fill("1000");
  await ui().getByRole("textbox", { name: "Jednostka" }).fill("zł");
  await ui().getByLabel("Start").fill(addDays(today, -6));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Oszczędności" })).toBeVisible();
  await expect(ui().getByTestId("goal-chart").getByRole("img")).toHaveAttribute("aria-label", new RegExp(`do ${today}: 0 zł z 1000 zł`)); // flat line before any entry

  for (const [day, amount] of [[addDays(today, -4), "200"], [addDays(today, -1), "300"]]) {
    await page.goto(`/daily/${day}`);
    await page.waitForLoadState("networkidle");
    await ui().getByRole("textbox", { name: "Oszczędności" }).fill(amount);
    await page.getByRole("button", { name: "Zapisz dzień" }).click();
    await expect(ui().getByText("Zapisano.")).toBeVisible();
  }

  await page.goto("/goals");
  await ui().getByRole("link", { name: "Oszczędności" }).click();
  const chart = ui().getByTestId("goal-chart");
  await expect(chart).toBeVisible();
  await expect(chart.getByRole("img")).toHaveAttribute("aria-label", new RegExp(`do ${today}: 500 zł z 1000 zł`));
});
