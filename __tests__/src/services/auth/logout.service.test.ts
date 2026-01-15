import { beforeEach, describe, expect, test, vi } from "vitest";
import { Types } from "mongoose";

import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";
import getUserByIdRepository from "@/repositories/user/get-user-by-id.repository";
import logoutService from "@/services/auth/logout.service";

vi.mock("@/repositories/user/get-user-by-id.repository");

describe("logoutService", () => {
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

  const logout = async (userId: string = mockedUser._id.toString()) => {
    return await logoutService(userId);
  };

  test("should return true if the user exists", async () => {
    vi.mocked(getUserByIdRepository).mockResolvedValue(mockedUser);

    const result = await logout();

    expect(result).toBe(true);
  });

  test("should return an error if the user does not exist", async () => {
    vi.mocked(getUserByIdRepository).mockResolvedValue(null);

    const result = await logout();

    expect(result).toHaveProperty("statusCode", 404);
    expect(result).toHaveProperty("message", "error.auth.userNotFound");
  });

  test("should return internal error if repository throws", async () => {
    vi.mocked(getUserByIdRepository).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await logout();

    expect(result).toHaveProperty("statusCode", 500);
    expect(result).toHaveProperty(
      "message",
      "error.auth.internalErrorAuthentication",
    );
  });
});
