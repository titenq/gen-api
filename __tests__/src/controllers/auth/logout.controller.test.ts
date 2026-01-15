import { FastifyReply, FastifyRequest } from "fastify";
import { beforeEach, describe, expect, test, vi } from "vitest";

import logoutController from "@/controllers/auth/logout.controller";
import logoutService from "@/services/auth/logout.service";
import cookiesOptions from "@/helpers/cookies-options";

vi.mock("@/services/auth/logout.service");
vi.mock("@/helpers/create-error-message", () => ({
  default: (message: string, statusCode: number) => ({
    error: true,
    message,
    statusCode,
  }),
}));
vi.mock("@/handlers/error.handler", () => ({
  default: (error: any, _req: any, reply: any) => {
    return reply.status(error.statusCode).send({ message: error.message });
  },
}));

describe("logoutController", () => {
  let request: any;
  let reply: any;

  beforeEach(() => {
    vi.clearAllMocks();
    request = {
      jwtVerify: vi.fn().mockResolvedValue({ _id: "user123" }),
      log: {
        info: vi.fn(),
        error: vi.fn(),
      },
      i18n: {
        t: vi.fn((key: string) => key),
      },
    } as unknown as FastifyRequest;

    reply = {
      clearCookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  });

  test("should logout successfully", async () => {
    vi.mocked(logoutService).mockResolvedValue(true);

    await logoutController(request, reply);

    expect(logoutService).toHaveBeenCalledWith("user123");
    expect(reply.clearCookie).toHaveBeenCalledWith(
      "accessToken",
      cookiesOptions.accessToken,
    );
    expect(reply.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      cookiesOptions.refreshToken,
    );
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message: "message.auth.logoutSuccessful",
    });
  });

  test("should handle service error", async () => {
    const errorResponse = {
      error: true,
      message: "error.auth.userNotFound",
      statusCode: 404,
    };

    vi.mocked(logoutService).mockResolvedValue(errorResponse);

    await logoutController(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "error.auth.userNotFound",
    });
  });

  test("should handle unexpected errors", async () => {
    request.jwtVerify.mockRejectedValue(new Error("JWT missing"));

    await logoutController(request, reply);

    expect(reply.clearCookie).toHaveBeenCalledWith(
      "accessToken",
      cookiesOptions.accessToken,
    );
    expect(reply.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      cookiesOptions.refreshToken,
    );
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "error.auth.invalidAccessToken",
    });
  });
});
