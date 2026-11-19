import { defineConfig } from "@playwright/test";

// One admin per run: the app treats this e-mail as the administrator, the invite test signs up as it.
process.env.E2E_ADMIN_EMAIL ??= `e2e-admin-${Date.now()}@rls-test.local`;

// Requires the local Supabase stack (`npx supabase start`) and a fresh `npm run build`.
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL: "http://localhost:3100", channel: "chrome" },
  webServer: {
    command: "npm run start",
    env: {
      PORT: "3100",
      ALLOW_PUBLIC_SIGNUP: "true",
      ADMIN_EMAILS: process.env.E2E_ADMIN_EMAIL!,
    },
    url: "http://localhost:3100/login",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
