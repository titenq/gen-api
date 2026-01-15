import { beforeEach, describe, expect, test, vi } from "vitest";
import { Types } from "mongoose";

import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import {
  createUserRepository,
  updateEmailVerificationTokenRepository,
} from "@/repositories/auth/register.repository";

vi.mock("@/models/User.model");

describe("register.repository", () => {
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
    vi.clearAllMocks();
  });

  test("createUserRepository should create a user and return IUserResponseModified", async () => {
    const createMock = vi.spyOn(UserModel, "create").mockResolvedValue({
      toObject: vi.fn().mockReturnValue(mockUser),
    } as any);

    const result = await createUserRepository({
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(createMock).toHaveBeenCalledWith({
      email: mockUser.email,
      name: mockUser.name,
      password: "Password!1",
    });

    expect(result).toEqual(mockUser);
  });

  test("updateEmailVerificationTokenRepository should update token and return IUserResponseModified", async () => {
    const leanMock = vi.fn().mockResolvedValue(mockUser);
    const findByIdAndUpdateMock = vi
      .spyOn(UserModel, "findByIdAndUpdate")
      .mockReturnValue({ lean: leanMock } as any);

    const token = "verification-token";
    const userId = mockUser._id.toString();
    const result = await updateEmailVerificationTokenRepository(userId, token);

    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      { _id: userId },
      { emailVerificationToken: token },
      { new: true },
    );

    expect(result).toEqual(mockUser);
  });

  test("updateEmailVerificationTokenRepository should return null if user not found", async () => {
    const leanMock = vi.fn().mockResolvedValue(null);

    vi.spyOn(UserModel, "findByIdAndUpdate").mockReturnValue({
      lean: leanMock,
    } as any);

    const result = await updateEmailVerificationTokenRepository(
      new Types.ObjectId().toString(),
      "verification-token",
    );

    expect(result).toBeNull();
  });
});
