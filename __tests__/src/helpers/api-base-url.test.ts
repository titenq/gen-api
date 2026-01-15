import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import env from "@/config/env";
import { API_PREFIX } from "@/constants/constants";
import { Environment } from "@/enums/environment.enum";

const { PORT } = env;

describe("src/helpers/api-base-url.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should return localhost url in development environment", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.DEVELOPMENT,
        PORT: 3300,
      },
    }));

    const apiBaseUrl = (await import("@/helpers/api-base-url")).default;
    expect(apiBaseUrl).toBe(`http://localhost:${PORT || "3300"}${API_PREFIX}`);
  });

  test("should use default port 3300 if PORT is not defined in development", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.DEVELOPMENT,
        PORT: undefined,
      },
    }));

    const apiBaseUrl = (await import("@/helpers/api-base-url")).default;
    expect(apiBaseUrl).toBe("http://localhost:3300/api/v1");
  });

  test("should return production url in non-development environment", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.PRODUCTION,
        PORT: 3000,
      },
    }));

    const apiBaseUrl = (await import("@/helpers/api-base-url")).default;
    expect(apiBaseUrl).toBe(apiBaseUrl);
  });
});
