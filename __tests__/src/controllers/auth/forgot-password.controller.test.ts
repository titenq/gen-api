import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import forgotPassword from "@/controllers/auth/forgot-password.controller";
import forgotPasswordService from "@/services/auth/forgot-password.service";
import errorHandler from "@/handlers/error.handler";
import { AuthInterface } from "@/interfaces";

vi.mock("@/services/auth/forgot-password.service");
vi.mock("@/handlers/error.handler");

describe("forgotPassword controller", () => {
  let mockRequest: FastifyRequest<{
    Body: AuthInterface.IForgotPasswordBody;
    Headers: AuthInterface.IForgotPasswordHeaders;
  }>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    mockRequest = {
      body: { email: "john@example.com" },
      headers: {},
      server: {} as any,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as typeof mockRequest;

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    vi.clearAllMocks();
  });

  test("should send 200 with response when forgotPasswordService succeeds", async () => {
    const mockResponse = { message: "reset email sent" };

    vi.mocked(forgotPasswordService).mockResolvedValueOnce(mockResponse);

    await forgotPassword(mockRequest, mockReply);

    expect(forgotPasswordService).toHaveBeenCalledWith(mockRequest.server, {
      email: "john@example.com",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
    expect(errorHandler).not.toHaveBeenCalled();
  });

  test("should call errorHandler when forgotPasswordService returns an error", async () => {
    const mockError = {
      error: true,
      message: "user not found",
      statusCode: 404,
    };

    vi.mocked(forgotPasswordService).mockResolvedValueOnce(mockError);

    await forgotPassword(mockRequest, mockReply);

    expect(forgotPasswordService).toHaveBeenCalledWith(mockRequest.server, {
      email: "john@example.com",
    });
    expect(errorHandler).toHaveBeenCalledWith(
      mockError,
      mockRequest,
      mockReply,
    );
    expect(mockReply.status).not.toHaveBeenCalledWith(200);
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
