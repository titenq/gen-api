import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

describe("src/helpers/cookies-options.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should return development options when NODE_ENV is development", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "development",
      },
    }));

    vi.doMock("@/constants/constants", () => ({
      ACCESS_TOKEN_EXPIRES: 900,
      REFRESH_TOKEN_EXPIRES: 86400,
    }));

    const cookiesOptions = (await import("@/helpers/cookies-options")).default;

    expect(cookiesOptions.accessToken).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      partitioned: false,
      maxAge: 900,
    });

    expect(cookiesOptions.refreshToken).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      partitioned: false,
      maxAge: 86400,
    });
  });

  test("should return production options when NODE_ENV is production", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "production",
      },
    }));

    vi.doMock("@/constants/constants", () => ({
      ACCESS_TOKEN_EXPIRES: 900,
      REFRESH_TOKEN_EXPIRES: 86400,
    }));

    const cookiesOptions = (await import("@/helpers/cookies-options")).default;

    expect(cookiesOptions.accessToken).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
      maxAge: 900,
    });

    expect(cookiesOptions.refreshToken).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
      maxAge: 86400,
    });
  });
});
