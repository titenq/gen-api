import { describe, test, expect, vi } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import resetPasswordService from "@/services/auth/reset-password.service";
import { AuthInterface } from "@/interfaces";
import resetPassword from "@/controllers/auth/reset-password.controller";

vi.mock("@/handlers/error.handler");
vi.mock("@/services/auth/reset-password.service");

describe("resetPassword controller", () => {
  test("should return 200 and response when resetPasswordService succeeds", async () => {
    const mockResponse = {
      message: "Password reset successfully",
    };

    vi.mocked(resetPasswordService).mockResolvedValue(mockResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IResetPasswordBody }> =
      {
        body: { token: "valid-token", password: "NewPass123!" },
        server: {} as any,
        log: {
          error: vi.fn(),
          info: vi.fn(),
        },
      } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await resetPassword(request, reply);

    expect(resetPasswordService).toHaveBeenCalledWith(request.server, {
      token: "valid-token",
      password: "NewPass123!",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should call errorHandler when resetPasswordService returns error", async () => {
    const errorResponse = {
      error: true,
      message: "Invalid or expired token",
      statusCode: 400,
    };

    vi.mocked(resetPasswordService).mockResolvedValue(errorResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IResetPasswordBody }> =
      {
        body: { token: "invalid-token", password: "NewPass123!" },
        server: {} as any,
        log: {
          error: vi.fn(),
          info: vi.fn(),
        },
      } as any;

    const reply = {} as unknown as FastifyReply;

    await resetPassword(request, reply);

    expect(errorHandler).toHaveBeenCalledWith(errorResponse, request, reply);
  });
});
