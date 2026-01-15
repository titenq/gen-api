import { describe, test, expect, vi, beforeEach } from "vitest";

import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import getUserByNameRepository from "@/repositories/user/get-user-by-name.repository";

vi.mock("@/models/User.model");

describe("getUserByNameRepository", () => {
  const mockUser = {
    _id: "456",
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword",
    emailVerificationToken: "token123",
  } as unknown as UserInterface.IUserResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return a user when name exists", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    });

    (UserModel.findOne as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByNameRepository("John Doe");

    expect(UserModel.findOne).toHaveBeenCalledWith({ name: "John Doe" });
    expect(selectMock).toHaveBeenCalledWith(
      "+password +emailVerificationToken",
    );
    expect(result).toEqual(mockUser);
  });

  test("should return null when user does not exist", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    (UserModel.findOne as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByNameRepository("Nonexistent User");

    expect(UserModel.findOne).toHaveBeenCalledWith({
      name: "Nonexistent User",
    });
    expect(selectMock).toHaveBeenCalledWith(
      "+password +emailVerificationToken",
    );
    expect(result).toBeNull();
  });
});
