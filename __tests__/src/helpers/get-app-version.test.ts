import fs from "node:fs";
import path from "node:path";

import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs");
vi.mock("node:path");

describe("getAppVersion", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("should return the version from package.json", async () => {
    vi.resetModules();

    const { default: getAppVersion } =
      await import("@/helpers/get-app-version");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ version: "1.0.0" }),
    );

    const version = getAppVersion();

    expect(version).toBe("1.0.0");
  });

  test("should return 'unknown' if version is missing in package.json", async () => {
    vi.resetModules();

    const { default: getAppVersion } =
      await import("@/helpers/get-app-version");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));

    const version = getAppVersion();

    expect(version).toBe("1.0.0");
  });

  test("should return 'unknown' if an error occurs", async () => {
    vi.resetModules();

    const { default: getAppVersion } =
      await import("@/helpers/get-app-version");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("File not found");
    });

    const version = getAppVersion();

    expect(version).toBe("1.0.0");
  });

  test("should return cached version on subsequent calls", async () => {
    vi.resetModules();

    const { default: getAppVersion } =
      await import("@/helpers/get-app-version");

    vi.mocked(path.resolve).mockReturnValue("/path/to/package.json");
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ version: "1.2.3" }),
    );

    expect(getAppVersion()).toBe("1.2.3");

    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ version: "9.9.9" }),
    );

    expect(getAppVersion()).toBe("1.2.3");
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });
});
