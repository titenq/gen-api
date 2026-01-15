import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";
import { Types } from "mongoose";

import { Roles } from "@/enums/user.enum";
import createErrorMessage from "@/helpers/create-error-message";
import { AuthInterface, ErrorInterface, UserInterface } from "@/interfaces";
import forgotPasswordRepository from "@/repositories/auth/forgot-password.repository";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";
import forgotPasswordService from "@/services/auth/forgot-password.service";

vi.mock("@/repositories/user/get-user-by-email.repository");
vi.mock("@/repositories/auth/forgot-password.repository");
vi.mock("@/helpers/create-error-message");

describe("forgotPasswordService", () => {
  let fastifyMock: FastifyInstance;

  const mockUser: UserInterface.IUserResponse = {
    _id: new Types.ObjectId(),
    email: "user@example.com",
    name: "Test User",
    password: "hashedPassword!",
    roles: [Roles.USER],
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    fastifyMock = {
      jwt: {
        sign: vi.fn().mockReturnValue("signed-token"),
      },
      rabbitMQ: {
        publishMessage: vi.fn().mockResolvedValue(undefined),
      },
      i18n: vi.fn().mockReturnValue("Reset password link sent successfully"),
    } as unknown as FastifyInstance;
  });

  test("should return error if user not found", async () => {
    vi.mocked(getUserByEmailRepository).mockResolvedValue(null);

    const errorMock: ErrorInterface.IGenericError = {
      error: true,
      message: "User not found",
      statusCode: 404,
    };

    vi.mocked(createErrorMessage).mockReturnValue(errorMock);

    const result = await forgotPasswordService(fastifyMock, {
      email: "notfound@test.com",
    });

    expect(getUserByEmailRepository).toHaveBeenCalledWith("notfound@test.com");
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.userNotFound",
      404,
    );
    expect(result).toEqual(errorMock);
  });

  test("should send forgot password link successfully", async () => {
    vi.mocked(getUserByEmailRepository).mockResolvedValue(mockUser);

    const mockUserModel = {
      ...mockUser,
    } as unknown as UserInterface.IUserModel;

    vi.mocked(forgotPasswordRepository).mockResolvedValue(mockUserModel);

    const body: AuthInterface.IForgotPasswordBody = {
      email: "user@example.com",
    };

    const result = await forgotPasswordService(fastifyMock, body);

    expect(getUserByEmailRepository).toHaveBeenCalledWith("user@example.com");
    expect(fastifyMock.jwt.sign).toHaveBeenCalledWith(
      { _id: mockUser._id },
      { expiresIn: expect.any(Number) },
    );
    expect(forgotPasswordRepository).toHaveBeenCalledWith(
      mockUser._id.toString(),
      "signed-token",
    );
    expect(fastifyMock.rabbitMQ.publishMessage).toHaveBeenCalledWith(
      "send_forgot_password_queue",
      JSON.stringify({
        userEmail: "user@example.com",
        forgotPasswordLink:
          "https://frontend.com/forgot-password?token=signed-token",
      }),
    );
    expect(result).toEqual({
      message: "Reset password link sent successfully",
    });
  });

  test("should return error if an unexpected error occurs", async () => {
    vi.mocked(getUserByEmailRepository).mockRejectedValue(new Error("DB down"));

    const errorMock: ErrorInterface.IGenericError = {
      error: true,
      message: "Internal error",
      statusCode: 500,
    };

    vi.mocked(createErrorMessage).mockReturnValue(errorMock);

    const result = await forgotPasswordService(fastifyMock, {
      email: "user@example.com",
    });

    expect(result).toEqual(errorMock);
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.auth.resetPasswordLinkError",
    );
  });
});
