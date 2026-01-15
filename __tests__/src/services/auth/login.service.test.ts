import { beforeEach, describe, expect, test, vi } from "vitest";
import argon2 from "argon2";
import { Types } from "mongoose";

import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";
import loginService from "@/services/auth/login.service";

vi.mock("@/repositories/user/get-user-by-email.repository");
vi.mock("argon2");

describe("loginService", () => {
  const mockedUser: UserInterface.IUserResponse = {
    _id: new Types.ObjectId(),
    email: "test@test.com",
    password: "hashedPassword1!",
    roles: [Roles.USER],
    isEmailVerified: true,
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const login = async (email = "test@test.com", password = "Password123!") => {
    return await loginService({ email, password });
  };

  test("should return the user if the credentials are valid", async () => {
    vi.mocked(getUserByEmailRepository).mockResolvedValue(mockedUser);
    vi.mocked(argon2.verify).mockResolvedValue(true);

    const result = await login();

    expect(result).toEqual(mockedUser);
  });

  test("should return an error if the user does not exist", async () => {
    vi.mocked(getUserByEmailRepository).mockResolvedValue(null);

    const result = await login("nonexistent@test.com");

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.invalidCredentials");
  });

  test("should return an error if the user's email is not verified", async () => {
    const unverifiedUser = { ...mockedUser, isEmailVerified: false };

    vi.mocked(getUserByEmailRepository).mockResolvedValue(unverifiedUser);

    const result = await login();

    expect(result).toHaveProperty("statusCode", 403);
    expect(result).toHaveProperty("message", "error.auth.emailNotVerified");
  });

  test("should return an error if the password is incorrect", async () => {
    vi.mocked(getUserByEmailRepository).mockResolvedValue(mockedUser);
    vi.mocked(argon2.verify).mockResolvedValue(false);

    const result = await login("test@test.com", "WrongPassword1!");

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.invalidCredentials");
  });

  test("should return access token expired error if error contains 'expired'", async () => {
    vi.mocked(getUserByEmailRepository).mockImplementation(() => {
      throw new Error("Token expired");
    });

    const result = await login();

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.accessTokenExpired");
  });

  test("should return invalid signature error if error contains 'signature'", async () => {
    vi.mocked(getUserByEmailRepository).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const result = await login();

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.invalidSignature");
  });

  test("should return invalid token format error if error contains 'malformed'", async () => {
    vi.mocked(getUserByEmailRepository).mockImplementation(() => {
      throw new Error("Token malformed");
    });

    const result = await login();

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.invalidTokenFormat");
  });

  test("should return invalid token format error if error contains 'invalid'", async () => {
    vi.mocked(getUserByEmailRepository).mockImplementation(() => {
      throw new Error("Token invalid");
    });

    const result = await login();

    expect(result).toHaveProperty("statusCode", 401);
    expect(result).toHaveProperty("message", "error.auth.invalidTokenFormat");
  });

  test("should return internal error if error does not match known cases", async () => {
    vi.mocked(getUserByEmailRepository).mockImplementation(() => {
      throw new Error("Unexpected failure");
    });

    const result = await login();

    expect(result).toHaveProperty("statusCode", 500);
    expect(result).toHaveProperty(
      "message",
      "error.auth.internalErrorAuthentication",
    );
  });
});
