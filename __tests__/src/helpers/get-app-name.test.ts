import fs from "node:fs";
import path from "node:path";

import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs");
vi.mock("node:path");

describe("getAppName", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("should return the name from package.json", async () => {
    vi.resetModules();

    const { default: getAppName } = await import("@/helpers/get-app-name");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "my-app" }),
    );

    const name = getAppName();

    expect(name).toBe("my-app");
  });

  test("should return 'app' if name is missing in package.json", async () => {
    vi.resetModules();

    const { default: getAppName } = await import("@/helpers/get-app-name");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));

    const name = getAppName();

    expect(name).toBe("app");
  });

  test("should return 'app' if an error occurs", async () => {
    vi.resetModules();

    const { default: getAppName } = await import("@/helpers/get-app-name");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("File not found");
    });

    const name = getAppName();

    expect(name).toBe("app");
  });

  test("should return cached name on subsequent calls", async () => {
    vi.resetModules();

    const { default: getAppName } = await import("@/helpers/get-app-name");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "cached-app" }),
    );

    expect(getAppName()).toBe("cached-app");

    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "new-app" }),
    );

    expect(getAppName()).toBe("cached-app");
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });
});
