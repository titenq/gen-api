import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

import verifyRoles from "@/handlers/verify-roles.handler";
import errorHandler from "@/handlers/error.handler";
import createErrorMessage from "@/helpers/create-error-message";
import { Roles } from "@/enums/user.enum";

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

describe("src/handlers/verify-roles.handler.ts", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  const verifyJwtMock = vi.fn();

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      server: {
        jwt: {
          verify: verifyJwtMock,
        },
      } as any,
    };
    mockReply = {
      clearCookie: vi.fn(),
    };
    vi.clearAllMocks();
  });

  test("should call errorHandler if accessToken is missing", async () => {
    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.handler.tokenNotProvided",
      401,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should return true if user has required roles", async () => {
    mockRequest.cookies = { accessToken: "valid-token" };
    verifyJwtMock.mockReturnValue({ roles: [Roles.USER] });

    const result = await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(result).toBe(true);
    expect(errorHandler).not.toHaveBeenCalled();
  });

  test("should call errorHandler if user does not have required roles", async () => {
    mockRequest.cookies = { accessToken: "valid-token" };
    verifyJwtMock.mockReturnValue({ roles: [Roles.USER] });

    await verifyRoles([Roles.ADMIN])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.notAuthorized",
      403,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if token is expired", async () => {
    mockRequest.cookies = { accessToken: "expired-token" };
    verifyJwtMock.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.accessTokenExpired",
      401,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if token is malformed", async () => {
    mockRequest.cookies = { accessToken: "malformed-token" };
    verifyJwtMock.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.invalidTokenFormat",
      401,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if token is invalid", async () => {
    mockRequest.cookies = { accessToken: "invalid-token" };
    verifyJwtMock.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.invalidToken",
      401,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if signature is invalid", async () => {
    mockRequest.cookies = { accessToken: "invalid-signature-token" };
    verifyJwtMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.invalidSignature",
      401,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if internal error occurs", async () => {
    mockRequest.cookies = { accessToken: "error-token" };
    verifyJwtMock.mockImplementation(() => {
      throw new Error("unknown error");
    });

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.internalErrorAuthentication",
      500,
    );
    expect(errorHandler).toHaveBeenCalled();
  });

  test("should call errorHandler if token has no roles", async () => {
    mockRequest.cookies = { accessToken: "valid-token" };
    verifyJwtMock.mockReturnValue({});

    await verifyRoles([Roles.USER])(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.notAuthorized",
      403,
    );
    expect(errorHandler).toHaveBeenCalled();
  });
});
