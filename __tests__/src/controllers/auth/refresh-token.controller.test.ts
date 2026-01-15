import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  FastifyReply,
  FastifyRequest,
  FastifyInstance,
  FastifyBaseLogger,
} from "fastify";

import errorHandler from "@/handlers/error.handler";
import cookiesOptions from "@/helpers/cookies-options";
import createErrorMessage from "@/helpers/create-error-message";
import refreshTokenService from "@/services/auth/refresh-token.service";
import { refreshToken } from "@/controllers/auth";

vi.mock("@/handlers/error.handler", () => ({
  default: vi.fn(),
}));

vi.mock("@/helpers/cookies-options", () => ({
  default: {
    accessToken: { path: "/", httpOnly: true },
    refreshToken: { path: "/", httpOnly: true },
  },
}));

vi.mock("@/helpers/create-error-message", () => ({
  default: vi.fn().mockReturnValue({ error: true, message: "mocked error" }),
}));

vi.mock("@/services/auth/refresh-token.service", () => ({
  default: vi.fn(),
}));

describe("refreshToken controller", () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  let mockServer: FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    mockServer = {} as FastifyInstance;

    request = {
      cookies: {},
      i18n: {
        t: vi.fn((key) => key),
      },
      server: mockServer,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      } as unknown as FastifyBaseLogger,
    };

    reply = {
      clearCookie: vi.fn().mockReturnThis(),
      setCookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  test("should return error when refresh token is not provided", async () => {
    await refreshToken(request as FastifyRequest, reply as FastifyReply);

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.refreshTokenNotProvided",
      401,
    );
    expect(errorHandler).toHaveBeenCalledWith(
      { error: true, message: "mocked error" },
      request,
      reply,
    );
  });

  test("should call errorHandler and clear cookies when service returns error", async () => {
    (request.cookies as any).refreshToken = "invalid-token";
    (refreshTokenService as any).mockResolvedValueOnce({
      error: true,
      message: "invalid refresh token",
    });

    await refreshToken(request as FastifyRequest, reply as FastifyReply);

    expect(refreshTokenService).toHaveBeenCalledWith(
      request.server,
      "invalid-token",
    );
    expect(reply.clearCookie).toHaveBeenCalledWith(
      "accessToken",
      cookiesOptions.accessToken,
    );
    expect(reply.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      cookiesOptions.refreshToken,
    );
    expect(errorHandler).toHaveBeenCalledWith(
      { error: true, message: "invalid refresh token" },
      request,
      reply,
    );
  });

  test("should set new cookies and return success message when refresh is successful", async () => {
    (request.cookies as any).refreshToken = "valid-token";
    (refreshTokenService as any).mockResolvedValueOnce({
      newAccessToken: "new-access",
      newRefreshToken: "new-refresh",
    });

    await refreshToken(request as FastifyRequest, reply as FastifyReply);

    expect(refreshTokenService).toHaveBeenCalledWith(
      request.server,
      "valid-token",
    );
    expect(reply.setCookie).toHaveBeenCalledWith(
      "accessToken",
      "new-access",
      cookiesOptions.accessToken,
    );
    expect(reply.setCookie).toHaveBeenCalledWith(
      "refreshToken",
      "new-refresh",
      cookiesOptions.refreshToken,
    );
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message: "message.auth.tokensUpdatedSuccess",
    });
  });
});
