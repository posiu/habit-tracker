import { expect, test } from "@playwright/test";

const email = `e2e-goals-${Date.now()}@rls-test.local`;

test("goals: create, log on the day screen, track progress, close and reopen", async ({ page }) => {
  const ui = () => page.locator("main:visible");

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Pulpit" })).toBeVisible();

  // value goal: validation first (missing target), then success
  await page.goto("/goals/new");
  await ui().getByLabel("Nazwa").fill("Oszczędności");
  await ui().getByLabel("Typ celu").selectOption("target_value");
  await ui().getByRole("textbox", { name: "Jednostka" }).fill("zł");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByText("Podaj wartość docelową")).toBeVisible();
  await expect(ui().getByLabel("Nazwa")).toHaveValue("Oszczędności");
  await expect(ui().getByLabel("Typ celu")).toHaveValue("target_value");
  await ui().getByRole("textbox", { name: "Wartość docelowa" }).fill("1000");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Oszczędności" })).toBeVisible();

  // days goal with an explicit target of 5 days
  await page.goto("/goals/new");
  await ui().getByLabel("Nazwa").fill("Spacer");
  await ui().getByLabel("Typ celu").selectOption("days_doing");
  await ui().getByRole("textbox", { name: /Liczba dni/ }).fill("5");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Spacer" })).toBeVisible();

  // date goal and a manual goal
  await page.goto("/goals/new");
  await ui().getByLabel("Nazwa").fill("Maraton");
  await ui().getByLabel("Typ celu").selectOption("target_date");
  // the deadline is required by the browser for this type (server-side rule is unit-tested)
  await expect(ui().getByLabel("Termin", { exact: true })).toHaveAttribute("required", "");
  await ui().getByLabel("Termin", { exact: true }).fill("2999-01-01");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Maraton" })).toBeVisible();

  // log the day: +300 zł, walked today; date/custom goals are not loggable
  await page.getByRole("link", { name: "Dziś" }).click();
  await expect(ui().getByRole("textbox", { name: "Oszczędności" })).toBeVisible();
  await expect(ui().getByText("Maraton")).toHaveCount(0);
  await ui().getByRole("textbox", { name: "Oszczędności" }).fill("0");
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Wartość musi być większa od zera")).toBeVisible();
  await expect(ui().getByLabel("Spacer")).toBeVisible();
  await ui().getByRole("textbox", { name: "Oszczędności" }).fill("300");
  await ui().getByLabel("Spacer").check();
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();

  // progress on the list: 300/1000 = 30%, 1/5 days = 20%
  await page.goto("/goals");
  const money = ui().getByTestId("goal-card").filter({ hasText: "Oszczędności" });
  const walk = ui().getByTestId("goal-card").filter({ hasText: "Spacer" });
  await expect(money.getByTestId("goal-amount")).toContainText("300 / 1000 zł");
  await expect(money.getByTestId("goal-amount")).toContainText("30%");
  await expect(walk.getByTestId("goal-amount")).toContainText("1 / 5 dni");
  await expect(walk.getByTestId("goal-amount")).toContainText("20%");

  // a decrement lowers the sum: +300 then −100 on the same day replaces the entry (one entry per day)
  await page.getByRole("link", { name: "Dziś" }).click();
  await ui().getByLabel("Kierunek zmiany: Oszczędności").selectOption("dec");
  await ui().getByRole("textbox", { name: "Oszczędności" }).fill("100");
  await page.getByRole("button", { name: "Zapisz dzień" }).click();
  await expect(ui().getByText("Zapisano.")).toBeVisible();
  await page.goto("/goals");
  await expect(ui().getByTestId("goal-card").filter({ hasText: "Oszczędności" }).getByTestId("goal-amount")).toContainText("-100 / 1000 zł");

  // dashboard lists active goals
  await page.goto("/");
  await expect(ui().getByTestId("dash-goal")).toHaveCount(3);

  // detail page shows the entry
  await page.goto("/goals");
  await ui().getByRole("link", { name: "Oszczędności" }).click();
  await expect(ui().getByText("−100 zł")).toBeVisible();

  // close, see it under "Zamknięte", reopen
  await page.goto("/goals");
  await ui().getByTestId("goal-card").filter({ hasText: "Spacer" }).getByRole("button", { name: "Zamknij cel" }).click();
  await expect(ui().getByTestId("goal-card").filter({ hasText: "Spacer" })).toHaveCount(0);
  await page.getByRole("link", { name: "Zamknięte" }).click();
  await expect(ui().getByTestId("goal-card").filter({ hasText: "Spacer" }).getByTestId("goal-status")).toHaveText("Zamknięty");
  await ui().getByRole("button", { name: "Wznów" }).click();
  await expect(ui().getByTestId("goal-card").filter({ hasText: "Spacer" })).toHaveCount(1);

  // edit then delete
  await ui().getByTestId("goal-card").filter({ hasText: "Spacer" }).getByRole("link", { name: "Edytuj" }).click();
  await ui().getByLabel("Nazwa").fill("Długi spacer");
  await page.getByRole("button", { name: "Zapisz" }).click();
  await expect(ui().getByRole("heading", { name: "Długi spacer" })).toBeVisible();
  await page.goto("/goals");
  page.once("dialog", (d) => d.accept());
  await ui().getByTestId("goal-card").filter({ hasText: "Długi spacer" }).getByRole("button", { name: "Usuń" }).click();
  await expect(ui().getByTestId("goal-card").filter({ hasText: "Długi spacer" })).toHaveCount(0);
});
