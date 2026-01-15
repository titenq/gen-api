import { describe, test, expect, vi, beforeEach } from "vitest";

import configRateLimit from "@/config/rate-limit";

vi.mock("@fastify/rate-limit", () => ({ default: "rate-limit-plugin" }));
vi.mock("@/constants/constants", () => ({
  RATE_LIMIT_BAN: 5,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_TIME_WINDOW: 60000,
}));

describe("src/config/rate-limit.ts", () => {
  let app: any;

  beforeEach(() => {
    app = {
      register: vi.fn(),
    };
    vi.clearAllMocks();
  });

  test("should register rateLimit plugin with correct options", async () => {
    await configRateLimit(app);

    expect(app.register).toHaveBeenCalledTimes(1);
    expect(app.register).toHaveBeenCalledWith("rate-limit-plugin", {
      global: true,
      hook: "preHandler",
      max: 100,
      timeWindow: 60000,
      ban: 5,
      allowList: ["127.0.0.1"],
      errorResponseBuilder: expect.any(Function),
    });
  });

  test("errorResponseBuilder should return correct error object when banned", async () => {
    await configRateLimit(app);

    const options = app.register.mock.calls[0][1];
    const errorResponseBuilder = options.errorResponseBuilder;

    const context = { ban: true };
    const request = {};

    const result = errorResponseBuilder(request, context);

    expect(result).toEqual({
      error: true,
      statusCode: 429,
      message: "error.ipBan",
    });
  });

  test("errorResponseBuilder should return correct error object when rate limit exceeded", async () => {
    await configRateLimit(app);

    const options = app.register.mock.calls[0][1];
    const errorResponseBuilder = options.errorResponseBuilder;
    const context = { ban: false };
    const request = {};
    const result = errorResponseBuilder(request, context);

    expect(result).toEqual({
      error: true,
      statusCode: 429,
      message: "error.rateLimitExceeded",
    });
  });
});
