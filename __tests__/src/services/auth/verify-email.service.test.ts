import { describe, test, beforeEach, expect, vi, MockedFunction } from "vitest";
import { FastifyInstance } from "fastify";

import verifyEmailService from "@/services/auth/verify-email.service";
import createErrorMessage from "@/helpers/create-error-message";
import {
  getUserByIdAndEmailTokenRepository,
  verifyUserEmailRepository,
} from "@/repositories/auth/verify-email.repository";
import { AuthInterface } from "@/interfaces";

vi.mock("@/helpers/create-error-message");
vi.mock("@/repositories/auth/verify-email.repository");

describe("verifyEmailService", () => {
  let fastify: FastifyInstance;
  let jwtVerifyMock: MockedFunction<
    (token: string) => Promise<AuthInterface.IDecodedToken>
  >;

  const decoded: AuthInterface.IDecodedToken = {
    _id: "user123",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    jwtVerifyMock = vi.fn();
    fastify = {
      jwt: { verify: jwtVerifyMock },
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should return verified user when token is valid and verification succeeds", async () => {
    const token = "valid-token";
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      roles: ["user"],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    jwtVerifyMock.mockResolvedValueOnce(decoded);
    vi.mocked(getUserByIdAndEmailTokenRepository).mockResolvedValueOnce(
      mockUser,
    );
    vi.mocked(verifyUserEmailRepository).mockResolvedValueOnce(mockUser);

    const result = await verifyEmailService(fastify, { token });

    expect(jwtVerifyMock).toHaveBeenCalledWith(token);
    expect(getUserByIdAndEmailTokenRepository).toHaveBeenCalledWith(
      decoded._id,
      token,
    );
    expect(verifyUserEmailRepository).toHaveBeenCalledWith(
      mockUser._id.toString(),
    );
    expect(result).toEqual({
      _id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      roles: mockUser.roles,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    });
  });

  test("should return error when user not found", async () => {
    const token = "invalid-token";

    jwtVerifyMock.mockResolvedValueOnce(decoded);
    vi.mocked(getUserByIdAndEmailTokenRepository).mockResolvedValueOnce(null);
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "failed-to-verify",
      statusCode: 400,
    });

    const result = await verifyEmailService(fastify, { token });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.failedToVerifyEmail",
    );
    expect(result).toEqual({
      error: true,
      message: "failed-to-verify",
      statusCode: 400,
    });
  });

  test("should return error when user verification fails", async () => {
    const token = "token";
    const mockUser = { _id: "user123" } as any;

    jwtVerifyMock.mockResolvedValueOnce(decoded);
    vi.mocked(getUserByIdAndEmailTokenRepository).mockResolvedValueOnce(
      mockUser,
    );
    vi.mocked(verifyUserEmailRepository).mockResolvedValueOnce(null);
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "verification-failed",
      statusCode: 400,
    });

    const result = await verifyEmailService(fastify, { token });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.failedToVerifyEmail",
    );
    expect(result).toEqual({
      error: true,
      message: "verification-failed",
      statusCode: 400,
    });
  });

  test("should return expired token error when JWT is expired", async () => {
    const token = "expired-token";

    jwtVerifyMock.mockImplementationOnce(() => {
      throw { code: "FAST_JWT_EXPIRED" };
    });
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "token-expired",
      statusCode: 401,
    });

    const result = await verifyEmailService(fastify, { token });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.accessTokenExpired",
      401,
    );
    expect(result).toEqual({
      error: true,
      message: "token-expired",
      statusCode: 401,
    });
  });

  test("should return generic error when unexpected exception occurs", async () => {
    const token = "token";

    jwtVerifyMock.mockImplementationOnce(() => {
      throw new Error("unexpected error");
    });
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "generic-error",
      statusCode: 500,
    });

    const result = await verifyEmailService(fastify, { token });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.failedToVerifyEmail",
    );
    expect(result).toEqual({
      error: true,
      message: "generic-error",
      statusCode: 500,
    });
  });
});
