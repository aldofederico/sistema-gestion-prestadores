import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [
      "client/src/**/*.test.ts",
      "client/src/**/*.test.tsx",
      "server/test/**/*.test.ts"
    ],
    setupFiles: ["./client/src/test/setup.ts"],
    coverage: {
      enabled: false
    }
  }
});
