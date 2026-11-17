import { defineConfig } from "@playwright/test";

// Requires the local Supabase stack (`npx supabase start`) and a fresh `npm run build`.
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL: "http://localhost:3100", channel: "chrome" },
  webServer: {
    command: "npm run start",
    env: { PORT: "3100" },
    url: "http://localhost:3100/login",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
