import { defineConfig } from "vitest/config";

// Local Supabase URL/key; workers inherit process.env.
process.loadEnvFile(".env.local");

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 20000,
  },
});
