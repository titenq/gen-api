import { describe, test, expect, vi, beforeEach } from "vitest";

import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import getUserByIdRepository from "@/repositories/user/get-user-by-id.repository";

vi.mock("@/models/User.model");

describe("getUserByIdRepository", () => {
  const mockUser = {
    _id: "123",
    name: "Jane Doe",
    email: "jane@example.com",
    roles: ["user"],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserInterface.IGetUserByIdResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return a user when found", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    });

    (UserModel.findById as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByIdRepository("123");

    expect(UserModel.findById).toHaveBeenCalledWith("123");
    expect(selectMock).toHaveBeenCalledWith("-__v");
    expect(result).toEqual(mockUser);
  });

  test("should return null when user is not found", async () => {
    const selectMock = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    (UserModel.findById as unknown as () => { select: typeof selectMock }) = vi
      .fn()
      .mockReturnValue({ select: selectMock });

    const result = await getUserByIdRepository("notfound-id");

    expect(UserModel.findById).toHaveBeenCalledWith("notfound-id");
    expect(selectMock).toHaveBeenCalledWith("-__v");
    expect(result).toBeNull();
  });
});
