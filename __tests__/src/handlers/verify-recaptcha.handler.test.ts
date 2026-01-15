import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

import verifyRecaptcha from "@/handlers/verify-recaptcha.handler";
import errorHandler from "@/handlers/error.handler";
import createErrorMessage from "@/helpers/create-error-message";
import env from "@/config/env";
import { RECAPTCHA_SECRET_KEY_TEST } from "@/constants/constants";
import { Environment } from "@/enums/environment.enum";

vi.mock("@/handlers/error.handler", () => ({
  default: vi.fn(),
}));

vi.mock("@/helpers/create-error-message", () => ({
  default: vi.fn((message, statusCode) => ({
    message,
    statusCode,
    error: true,
  })),
}));

vi.mock("@/config/env", () => ({
  default: {
    NODE_ENV: "test",
    RECAPTCHA_SECRET_KEY: "secret-key",
  },
}));

describe("src/handlers/verify-recaptcha.handler.ts", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    mockRequest = {
      headers: {},
    };
    mockReply = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should call errorHandler if recaptcha token is missing", async () => {
    await verifyRecaptcha(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.handler.recaptchaNotProvided",
      403,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if recaptcha token is empty", async () => {
    mockRequest.headers = { "x-recaptcha-token": "" };
    await verifyRecaptcha(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.handler.recaptchaNotProvided",
      403,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if google verification fails", async () => {
    mockRequest.headers = { "x-recaptcha-token": "token" };
    fetchMock.mockResolvedValue({
      ok: false,
    });

    await verifyRecaptcha(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(fetchMock).toHaveBeenCalled();
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.handler.recaptchaInvalid",
      403,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should return token if verification succeeds", async () => {
    mockRequest.headers = { "x-recaptcha-token": "valid-token" };
    fetchMock.mockResolvedValue({
      ok: true,
    });

    const result = await verifyRecaptcha(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(fetchMock).toHaveBeenCalled();
    expect(errorHandler).not.toHaveBeenCalled();
    expect(result).toBe("valid-token");
  });

  test("should use test secret key if NODE_ENV is development", async () => {
    env.NODE_ENV = Environment.DEVELOPMENT;
    mockRequest.headers = { "x-recaptcha-token": "valid-token" };
    fetchMock.mockResolvedValue({
      ok: true,
    });

    await verifyRecaptcha(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(RECAPTCHA_SECRET_KEY_TEST),
      expect.anything(),
    );
  });
});
