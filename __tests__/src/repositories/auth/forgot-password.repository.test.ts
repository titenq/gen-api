import { describe, test, expect, beforeEach, vi } from "vitest";

import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import forgotPasswordRepository from "@/repositories/auth/forgot-password.repository";

vi.mock("@/models/User.model");

describe("forgotPasswordRepository", () => {
  const mockedUser = {
    _id: "12345",
    email: "test@test.com",
    password: "hashedPassword",
    name: "Test User",
    roles: ["USER"],
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    forgotPasswordToken: "oldToken",
  } as unknown as UserInterface.IUserModel;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should update forgotPasswordToken and return the updated user", async () => {
    const newToken = "newToken123";

    vi.mocked(UserModel.findByIdAndUpdate).mockReturnValueOnce({
      lean: vi
        .fn()
        .mockResolvedValue({ ...mockedUser, forgotPasswordToken: newToken }),
    } as any);

    const result = await forgotPasswordRepository("12345", newToken);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "12345",
      { forgotPasswordToken: newToken },
      { new: true },
    );

    expect(result).toEqual({ ...mockedUser, forgotPasswordToken: newToken });
  });

  test("should return null if user is not found", async () => {
    const newToken = "newToken123";

    vi.mocked(UserModel.findByIdAndUpdate).mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await forgotPasswordRepository("nonexistentId", newToken);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "nonexistentId",
      { forgotPasswordToken: newToken },
      { new: true },
    );

    expect(result).toBeNull();
  });
});
