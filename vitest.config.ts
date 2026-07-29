import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests run in plain Node, with no DOM.
 *
 * That is a deliberate constraint rather than a convenience: every invariant
 * worth protecting in this codebase lives in a pure function, so needing a
 * browser to test something is a signal that the logic is in the wrong layer.
 * The impure edges — localStorage, the clock, `crypto.randomUUID`, the
 * atmosphere on screen — stay in the storage modules, which take their
 * inputs explicitly.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
