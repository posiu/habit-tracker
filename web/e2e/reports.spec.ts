import { expect, test } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/domain/entries";

const email = `e2e-reports-${Date.now()}@rls-test.local`;

test("weekly report and CSV export", async ({ page }) => {
  const ui = () => page.locator("main:visible");
  const today = todayIn("Europe/Warsaw");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/new");
  await ui().getByLabel("Nazwa").fill("=Czytanie, wieczorem");
  await ui().getByLabel("Start").fill(addDays(today, -1));
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Czytanie")).toBeVisible();

  // done today, missed yesterday
  await page.goto("/");
  await ui().getByRole("button", { name: /Czytanie/ }).click();
  await expect(ui().getByRole("button", { name: /Czytanie/ })).toHaveText("✓ Zrobione");

  await page.goto("/analiza/tydzien");
  await expect(ui().getByRole("heading", { name: "Analiza" })).toBeVisible();
  await expect(ui().getByRole("img", { name: /Wykres tygodnia/ })).toBeVisible();
  // the week may start before the habit did, so only days from yesterday on are due
  await expect(ui().getByText("Ukończone nawyki", { exact: true }).locator("..")).toContainText("%");
  await expect(ui().getByTestId("week-habits")).toContainText("Czytanie");

  // CSV export: signed-in only, formula-looking names are neutralized
  const res = await page.request.get("/eksport");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/csv");
  const body = await res.text();
  expect(body).toContain("data,nawyk,typ,wartosc,jednostka,ukonczone,nastroj,notatka");
  expect(body).toContain(`${today},"'=Czytanie, wieczorem",boolean,1,,tak`);

  const anon = await (await page.context().browser()!.newContext({ baseURL: "http://localhost:3100" })).request.get("/eksport", { maxRedirects: 0 });
  expect([307, 401]).toContain(anon.status());
});
