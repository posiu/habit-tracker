import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

test("yes/no habits confirm on Today; value habits open their own screen", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-log-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  const add = async (name: string, type?: string, target?: string, unit?: string) => {
    await page.goto("/habits/new");
    await page.waitForLoadState("networkidle");
    await ui().getByLabel("Nazwa").fill(name);
    if (type) await ui().getByLabel("Typ").selectOption({ label: type });
    if (target) await ui().getByLabel("Cel", { exact: true }).fill(target);
    if (unit) await ui().getByLabel("Jednostka").fill(unit);
    await ui().getByLabel("Start").fill(addDays(today, -3));
    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(ui().getByText(name).first()).toBeVisible();
  };
  await add("Woda");
  await add("Bieg", "Wartość liczbowa", "2", "km");
  await add("Pompki", "Licznik");

  // yes/no: confirmed in one tap on Today
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await ui().getByTestId("habit-row").filter({ hasText: "Woda" }).getByRole("button", { name: /odhaczyć/ }).click();
  await expect(ui().getByTestId("habit-row").filter({ hasText: "Woda" }).getByText("✓ Zrobione")).toBeVisible();

  // value habit: its own screen, only that habit
  await ui().getByTestId("habit-row").filter({ hasText: "Bieg" }).getByRole("link", { name: /uzupełnij/i }).click();
  await expect(ui().getByRole("heading", { name: "Bieg", level: 1 })).toBeVisible();
  await expect(ui().getByText("Woda")).toHaveCount(0);
  await ui().getByRole("textbox").fill("1,5");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();
  await expect(ui().getByText("1/3")).toBeVisible(); // Woda done, Bieg below its target

  // reaching the target completes it; the screen shows the saved value
  await page.goto(`/habits/${await idOf(page, "Bieg")}/log`);
  await expect(ui().getByRole("textbox")).toHaveValue("1.5");
  await ui().getByRole("textbox").fill("2");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("2/3")).toBeVisible();

  // backfilling a past day goes back to that day and leaves other habits alone
  const yesterday = addDays(today, -1);
  await page.goto(`/habits/${await idOf(page, "Pompki")}/log?date=${yesterday}`);
  await ui().getByRole("textbox").fill("20");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(page).toHaveURL(new RegExp(`/daily/${yesterday}`));
  await expect(ui().getByRole("textbox", { name: /Pompki/ })).toHaveValue("20");

  // an empty value clears the entry
  await page.goto(`/habits/${await idOf(page, "Pompki")}/log?date=${yesterday}`);
  await ui().getByRole("textbox").fill("");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("textbox", { name: /Pompki/ })).toHaveValue("");
});

async function idOf(page: import("@playwright/test").Page, name: string): Promise<string> {
  await page.goto("/habits");
  const href = await page.locator("main:visible").getByRole("link", { name }).first().getAttribute("href");
  return href!.split("/").pop()!;
}
