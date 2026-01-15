import { Environment } from "@/enums/environment.enum";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

describe("api-url", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return API_URL when NODE_ENV is PRODUCTION", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.PRODUCTION,
        API_URL: "https://api.production.com",
        PORT: 3000,
      },
    }));

    const { default: apiUrl } = await import("@/helpers/api-url");
    expect(apiUrl).toBe("https://api.production.com");
  });

  test("should return localhost URL when NODE_ENV is not PRODUCTION", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.DEVELOPMENT,
        PORT: 4000,
      },
    }));

    const { default: apiUrl } = await import("@/helpers/api-url");
    expect(apiUrl).toBe("http://localhost:4000");
  });

  test("should return localhost URL with default port 3300 when PORT is missing", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: Environment.DEVELOPMENT,
        PORT: undefined,
      },
    }));

    const { default: apiUrl } = await import("@/helpers/api-url");
    expect(apiUrl).toBe("http://localhost:3300");
  });
});
