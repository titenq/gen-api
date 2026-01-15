import { describe, test, expect, vi } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import errorHandler from "@/handlers/error.handler";
import resendLinkService from "@/services/auth/resend-link.service";
import { AuthInterface } from "@/interfaces";
import resendLink from "@/controllers/auth/resend-link.controller";

vi.mock("@/handlers/error.handler");
vi.mock("@/services/auth/resend-link.service");

describe("resendLink controller", () => {
  test("should return 200 and response when resendLinkService succeeds", async () => {
    const mockResponse = {
      message: "Verification link sent successfully",
    };

    vi.mocked(resendLinkService).mockResolvedValue(mockResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IResendLinkBody }> = {
      body: { email: "user@test.com" },
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

    await resendLink(request, reply);

    expect(resendLinkService).toHaveBeenCalledWith(request.server, {
      email: "user@test.com",
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should call errorHandler when resendLinkService returns error", async () => {
    const errorResponse = {
      error: true,
      message: "User not found",
      statusCode: 404,
    };

    vi.mocked(resendLinkService).mockResolvedValue(errorResponse);

    const request: FastifyRequest<{ Body: AuthInterface.IResendLinkBody }> = {
      body: { email: "user@test.com" },
      server: {} as any,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as any;

    const reply = {} as unknown as FastifyReply;

    await resendLink(request, reply);

    expect(errorHandler).toHaveBeenCalledWith(errorResponse, request, reply);
  });
});
