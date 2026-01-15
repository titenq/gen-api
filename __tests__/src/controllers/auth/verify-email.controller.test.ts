import { describe, test, expect, vi } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import verifyEmailService from "@/services/auth/verify-email.service";
import { AuthInterface } from "@/interfaces";
import verifyEmail from "@/controllers/auth/verify-email.controller";
import { Roles } from "@/enums/user.enum";

vi.mock("@/handlers/error.handler");
vi.mock("@/services/auth/verify-email.service");

describe("verifyEmail controller", () => {
  test("should return 200 and response when verifyEmailService succeeds", async () => {
    const mockResponse = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      roles: [Roles.USER],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(verifyEmailService).mockResolvedValue(mockResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IVerifyEmailBody }> = {
      body: { token: "valid-token" },
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

    await verifyEmail(request, reply);

    expect(verifyEmailService).toHaveBeenCalledWith(request.server, {
      token: "valid-token",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should call errorHandler when verifyEmailService returns error", async () => {
    const errorResponse = {
      error: true,
      message: "Invalid or expired token",
      statusCode: 400,
    };

    vi.mocked(verifyEmailService).mockResolvedValue(errorResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IVerifyEmailBody }> = {
      body: { token: "invalid-token" },
      server: {} as any,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as any;

    const reply = {} as unknown as FastifyReply;

    await verifyEmail(request, reply);

    expect(errorHandler).toHaveBeenCalledWith(errorResponse, request, reply);
  });
});
