import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws when imported outside an RSC bundle; stub it so
      // server modules can be unit-tested in Node.
      "server-only": new URL("./test/stubs/server-only.ts", import.meta.url)
        .pathname,
      "@": new URL("./", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
