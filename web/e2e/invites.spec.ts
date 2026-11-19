import { expect, test } from "@playwright/test";

const MAIL = "http://127.0.0.1:57324/api/v1";

async function inviteLink(to: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const list = (await (await fetch(`${MAIL}/search?query=${encodeURIComponent(`to:${to}`)}`)).json()) as {
      messages: { ID: string }[];
    };
    if (list.messages.length > 0) {
      const msg = (await (await fetch(`${MAIL}/message/${list.messages[0].ID}`)).json()) as { HTML: string };
      const href = /href="([^"]*auth\/confirm[^"]*)"/.exec(msg.HTML)?.[1];
      if (href) return href.replaceAll("&amp;", "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no invitation e-mail for ${to}`);
}

test("admin invites a user by e-mail; they set a password and sign in", async ({ page, browser }) => {
  const admin = process.env.E2E_ADMIN_EMAIL!;
  const invitee = `e2e-invitee-${Date.now()}@rls-test.local`;

  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(admin);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  await page.goto("/ustawienia");
  await page.getByRole("link", { name: /Zaproszenia i użytkownicy/ }).click();
  await page.locator("main:visible").getByLabel(/Adres e-mail/).fill(invitee);
  await page.getByRole("button", { name: "Wyślij zaproszenie" }).click();
  await expect(page.locator("main:visible").getByText(`Zaproszenie wysłane na ${invitee}.`)).toBeVisible();
  await expect(page.getByTestId("user-list").getByText(invitee)).toBeVisible();

  // the invitee follows the link from the e-mail (Polish template) in a fresh browser
  const link = new URL(await inviteLink(invitee));
  const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
  const guest = await ctx.newPage();
  await guest.goto(`${link.pathname}${link.search}`);
  await expect(guest.getByRole("heading", { name: "Ustaw hasło" })).toBeVisible();
  await guest.getByLabel("Nowe hasło").fill("correct-horse-9");
  await guest.getByLabel("Powtórz hasło").fill("correct-horse-9");
  await guest.getByRole("button", { name: "Zapisz hasło" }).click();
  await expect(guest.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  // a regular user sees no admin panel
  await guest.goto("/ustawienia/zaproszenia");
  await expect(guest.getByText("Zaproszenia", { exact: true })).toHaveCount(0);
  await ctx.close();

  // the admin deletes the invited account on request
  await page.goto("/ustawienia/zaproszenia");
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("user-list").locator("li", { hasText: invitee }).getByRole("button", { name: "Usuń" }).click();
  await expect(page.getByTestId("user-list").getByText(invitee)).toHaveCount(0);
});

test("password reset by e-mail link", async ({ page, browser }) => {
  const email = `e2e-reset-${Date.now()}@rls-test.local`;
  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill("correct-horse-9");
  await page.getByRole("button", { name: "Zarejestruj" }).click();
  await expect(page.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
  const guest = await ctx.newPage();
  await guest.goto("/login");
  await guest.getByRole("link", { name: "Nie pamiętasz hasła?" }).click();
  await guest.waitForLoadState("networkidle"); // let the form hydrate before submitting
  await guest.locator("main:visible").getByLabel("E-mail").fill(email);
  await guest.getByRole("button", { name: "Wyślij link" }).click();
  await expect(guest.getByText("Jeśli konto istnieje")).toBeVisible();

  const link = new URL(await inviteLink(email));
  await guest.goto(`${link.pathname}${link.search}`);
  await guest.getByLabel("Nowe hasło").fill("brand-new-pass-1");
  await guest.getByLabel("Powtórz hasło").fill("brand-new-pass-1");
  await guest.getByRole("button", { name: "Zapisz hasło" }).click();
  await expect(guest.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();

  // the new password works for a fresh sign-in
  await guest.getByRole("link", { name: "Ustawienia" }).click();
  await guest.getByRole("button", { name: "Wyloguj" }).click();
  await guest.locator("main:visible").getByLabel("E-mail").fill(email);
  await guest.locator("main:visible").getByLabel("Hasło").fill("brand-new-pass-1");
  await guest.getByRole("button", { name: "Zaloguj" }).click();
  await expect(guest.getByRole("heading", { name: "Dziś", level: 1 })).toBeVisible();
  await ctx.close();
});
