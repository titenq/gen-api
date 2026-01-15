import { describe, test, expect, vi, beforeEach } from "vitest";

import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";

vi.mock("@/models/User.model");

describe("getUserByEmailRepository", () => {
  const mockUser = {
    _id: "123",
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword",
    emailVerificationToken: "token123",
    roles: ["user"],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserInterface.IUserResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return user when found", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    });

    (UserModel.findOne as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByEmailRepository("john@example.com");

    expect(UserModel.findOne).toHaveBeenCalledWith({
      email: "john@example.com",
    });
    expect(selectMock).toHaveBeenCalledWith(
      "+password +emailVerificationToken",
    );
    expect(result).toEqual(mockUser);
  });

  test("should return null when user not found", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    (UserModel.findOne as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByEmailRepository("notfound@example.com");

    expect(UserModel.findOne).toHaveBeenCalledWith({
      email: "notfound@example.com",
    });
    expect(selectMock).toHaveBeenCalledWith(
      "+password +emailVerificationToken",
    );
    expect(result).toBeNull();
  });
});
