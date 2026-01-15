import { describe, test, expect, vi } from "vitest";

import config from "../vitest.config";

vi.mock("vite-tsconfig-paths", () => ({
  default: () => "tsconfig-paths-plugin",
}));

describe("vitest.config", () => {
  test("should export correct configuration", () => {
    expect(config).toBeDefined();
    expect(config.plugins).toContain("tsconfig-paths-plugin");
    expect(config.test).toBeDefined();
    expect(config.test?.globals).toBe(true);
    expect(config.test?.environment).toBe("node");
    expect(config.test?.include).toContain("__tests__/**/*.test.{ts,js}");
    expect(config.test?.coverage).toBeDefined();
    expect(config.test?.coverage?.provider).toBe("istanbul");
    expect((config.test?.coverage as any)?.reporter).toEqual([
      "text",
      "json",
      "html",
    ]);
    expect(config.test?.coverage?.exclude).toContain("src/interfaces/**");
    expect(config.test?.coverage?.exclude).toContain("dist/**");
  });
});
