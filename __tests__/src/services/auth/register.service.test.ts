import { beforeEach, describe, expect, test, vi } from "vitest";
import { Types } from "mongoose";

import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";
import * as registerRepo from "@/repositories/auth/register.repository";
import registerService from "@/services/auth/register.service";

vi.mock("@/repositories/auth/register.repository");

describe("registerService", () => {
  let fastifyMock: any;

  const mockUser: UserInterface.IUserResponseModified = {
    _id: new Types.ObjectId(),
    email: "user@example.com",
    name: "Test User",
    roles: [Roles.USER],
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    fastifyMock = {
      jwt: {
        sign: vi.fn().mockReturnValue("signed-token"),
      },
      rabbitMQ: {
        publishMessage: vi.fn().mockResolvedValue(undefined),
      },
      publishWS: vi.fn().mockResolvedValue(undefined),
      i18n: {
        t: vi.fn().mockImplementation((key, params) => {
          if (key === "message.auth.newUserRegistered") {
            return `New user registered: ${params.email}`;
          }
          return key;
        }),
      },
    };

    vi.clearAllMocks();
  });

  test("should register user successfully", async () => {
    vi.mocked(registerRepo.createUserRepository).mockResolvedValue(mockUser);
    vi.mocked(
      registerRepo.updateEmailVerificationTokenRepository,
    ).mockResolvedValue(mockUser);

    const result = await registerService(fastifyMock, {
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(registerRepo.createUserRepository).toHaveBeenCalledWith({
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(fastifyMock.jwt.sign).toHaveBeenCalledWith(
      { _id: mockUser._id },
      { expiresIn: expect.any(Number) },
    );

    expect(
      registerRepo.updateEmailVerificationTokenRepository,
    ).toHaveBeenCalledWith(mockUser._id.toString(), "signed-token");

    expect(fastifyMock.rabbitMQ.publishMessage).toHaveBeenCalledWith(
      "send_verification_email_queue",
      JSON.stringify({
        userEmail: mockUser.email,
        verificationLink: `https://frontend.com/verify-email?token=signed-token`,
      }),
    );

    expect(fastifyMock.publishWS).toHaveBeenCalledWith("register", {
      event: "register",
      message: `New user registered: ${mockUser.email}`,
    });

    expect(result).toEqual(mockUser);
  });

  test("should return userNotFound if updateEmailVerificationTokenRepository returns null", async () => {
    vi.mocked(registerRepo.createUserRepository).mockResolvedValue(mockUser);
    vi.mocked(
      registerRepo.updateEmailVerificationTokenRepository,
    ).mockResolvedValue(null);

    const result = await registerService(fastifyMock, {
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(result).toEqual({
      error: true,
      message: "error.auth.userNotFound",
      statusCode: 404,
    });
  });

  test("should handle duplicate email error", async () => {
    const errorMock = { code: 11000, keyPattern: { email: 1 } };

    vi.mocked(registerRepo.createUserRepository).mockRejectedValue(errorMock);

    const result = await registerService(fastifyMock, {
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(result).toEqual({
      error: true,
      message: "error.auth.emailAlreadyExists",
      statusCode: 409,
    });
  });

  test("should handle duplicate name error", async () => {
    const errorMock = { code: 11000, keyPattern: { normalizedName: 1 } };

    vi.mocked(registerRepo.createUserRepository).mockRejectedValue(errorMock);

    const result = await registerService(fastifyMock, {
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(result).toEqual({
      error: true,
      message: "error.auth.nameAlreadyExists",
      statusCode: 409,
    });
  });

  test("should handle generic create user error", async () => {
    const errorMock = new Error("unknown error");

    vi.mocked(registerRepo.createUserRepository).mockRejectedValue(errorMock);

    const result = await registerService(fastifyMock, {
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(result).toEqual({
      error: true,
      message: "error.auth.createUserError",
      statusCode: 400,
    });
  });
});
