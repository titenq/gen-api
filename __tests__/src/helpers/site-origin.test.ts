import { describe, test, expect, vi, beforeEach } from "vitest";

describe("siteOrigin", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("should return localhost in development", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "development",
        ORIGIN: "https://example.com",
      },
    }));

    const { default: siteOrigin } = await import("@/helpers/site-origin");

    expect(siteOrigin).toBe("http://localhost:5173");
  });

  test("should return ORIGIN in production", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "production",
        ORIGIN: "https://example.com",
      },
    }));

    const { default: siteOrigin } = await import("@/helpers/site-origin");

    expect(siteOrigin).toBe("https://example.com");
  });

  test("should return empty string if ORIGIN is not set in production", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "production",
        ORIGIN: undefined,
      },
    }));

    const { default: siteOrigin } = await import("@/helpers/site-origin");

    expect(siteOrigin).toBe("");
  });
});
