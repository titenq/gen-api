import { describe, test, expect, vi, afterEach } from "vitest";

import UserModel from "@/models/User.model";
import {
  getUserByIdAndEmailTokenRepository,
  verifyUserEmailRepository,
} from "@/repositories/auth/verify-email.repository";

vi.mock("@/models/User.model", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe("verify-email.repository", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserByIdAndEmailTokenRepository", () => {
    test("should return user if found", async () => {
      const mockUser = { _id: "123", email: "user@example.com" };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);

      const result = await getUserByIdAndEmailTokenRepository(
        "123",
        "token123",
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: "123",
        emailVerificationToken: "token123",
      });
      expect(result).toEqual(mockUser);
    });

    test("should return null if user not found", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValue(null);

      const result = await getUserByIdAndEmailTokenRepository(
        "456",
        "wrong-token",
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: "456",
        emailVerificationToken: "wrong-token",
      });
      expect(result).toBeNull();
    });
  });

  describe("verifyUserEmailRepository", () => {
    test("should update user and return updated object", async () => {
      const mockUser = {
        _id: "123",
        email: "user@example.com",
        isEmailVerified: true,
      };

      const execMock = vi.fn().mockResolvedValue(mockUser);

      vi.mocked(UserModel.findOneAndUpdate).mockReturnValue({
        exec: execMock,
      } as any);

      const result = await verifyUserEmailRepository("123");

      expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "123" },
        { $set: { isEmailVerified: true, emailVerificationToken: null } },
        { new: true },
      );
      expect(result).toEqual(mockUser);
    });

    test("should return null if user not found", async () => {
      const execMock = vi.fn().mockResolvedValue(null);

      vi.mocked(UserModel.findOneAndUpdate).mockReturnValue({
        exec: execMock,
      } as any);

      const result = await verifyUserEmailRepository("999");

      expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "999" },
        { $set: { isEmailVerified: true, emailVerificationToken: null } },
        { new: true },
      );
      expect(result).toBeNull();
    });
  });
});
