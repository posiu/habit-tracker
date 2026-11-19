import { expect, test } from "@playwright/test";

test("manifest and icons are public, unknown pages show the not-found screen", async ({ page, request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m).toMatchObject({ name: "Habit Tracker", display: "standalone", start_url: "/" });
  for (const icon of m.icons) expect((await request.get(icon.src)).ok()).toBe(true);

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(`e2e-pwa-${Date.now()}@rls-test.local`);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/habits/00000000-0000-0000-0000-000000000000");
  await expect(page.getByRole("heading", { name: "Nie znaleziono strony" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wróć do ekranu Dziś" })).toBeVisible();
});
