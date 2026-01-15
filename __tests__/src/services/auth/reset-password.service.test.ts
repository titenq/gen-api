import { vi, describe, beforeEach, test, expect } from "vitest";
import { FastifyInstance } from "fastify";

import resetPasswordService from "@/services/auth/reset-password.service";
import createErrorMessage from "@/helpers/create-error-message";
import {
  getUserByForgotPasswordTokenRepository,
  updatePasswordRepository,
} from "@/repositories/auth/reset-password.repository";

vi.mock("@/helpers/create-error-message");
vi.mock("@/repositories/auth/reset-password.repository");

describe("resetPasswordService", () => {
  let fastify: FastifyInstance;

  beforeEach(() => {
    fastify = {
      jwt: {
        verify: vi.fn(),
      },
      i18n: vi.fn().mockReturnValue("mocked-translation"),
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should return success message when token is valid and user exists", async () => {
    const token = "valid-token";
    const password = "newPassword123";
    const mockUser = {
      _id: "user123",
      email: "user@example.com",
    } as any;

    vi.mocked(fastify.jwt.verify).mockReturnValueOnce({} as any);
    vi.mocked(getUserByForgotPasswordTokenRepository).mockResolvedValueOnce(
      mockUser,
    );
    vi.mocked(updatePasswordRepository).mockResolvedValueOnce(mockUser);

    const result = await resetPasswordService(fastify, { token, password });

    expect(getUserByForgotPasswordTokenRepository).toHaveBeenCalledWith(token);
    expect(updatePasswordRepository).toHaveBeenCalledWith(mockUser, password);
    expect(result).toEqual({ message: "mocked-translation" });
  });

  test("should return token not found error when user does not exist", async () => {
    const token = "invalid-token";
    const password = "password";

    vi.mocked(fastify.jwt.verify).mockReturnValueOnce({} as any);
    vi.mocked(getUserByForgotPasswordTokenRepository).mockResolvedValueOnce(
      null,
    );
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "token-not-found",
      statusCode: 404,
    });

    const result = await resetPasswordService(fastify, { token, password });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.resetPasswordTokenNotFound",
      404,
    );
    expect(result).toEqual({
      error: true,
      message: "token-not-found",
      statusCode: 404,
    });
  });

  test("should return token expired error when JWT expired", async () => {
    const token = "expired-token";
    const password = "password";

    vi.mocked(fastify.jwt.verify).mockImplementationOnce(() => {
      throw { code: "FAST_JWT_EXPIRED" };
    });
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "token-expired",
      statusCode: 401,
    });

    const result = await resetPasswordService(fastify, { token, password });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.resetPasswordTokenExpired",
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
    const password = "password";

    vi.mocked(fastify.jwt.verify).mockImplementationOnce(() => {
      throw new Error("unexpected error");
    });
    vi.mocked(createErrorMessage).mockReturnValueOnce({
      error: true,
      message: "generic-error",
      statusCode: 500,
    });

    const result = await resetPasswordService(fastify, { token, password });

    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.resetPasswordError",
    );
    expect(result).toEqual({
      error: true,
      message: "generic-error",
      statusCode: 500,
    });
  });
});
