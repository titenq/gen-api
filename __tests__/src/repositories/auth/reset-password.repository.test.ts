import { afterEach, describe, expect, test, vi } from "vitest";

import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import {
  getUserByForgotPasswordTokenRepository,
  updatePasswordRepository,
} from "@/repositories/auth/reset-password.repository";

vi.mock("@/models/User.model", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe("reset-password.repository", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserByForgotPasswordTokenRepository", () => {
    test("should return user if token is found", async () => {
      const mockUser = { _id: "123", forgotPasswordToken: "token123" };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);

      const result = await getUserByForgotPasswordTokenRepository("token123");

      expect(UserModel.findOne).toHaveBeenCalledWith({
        forgotPasswordToken: "token123",
      });
      expect(result).toEqual(mockUser);
    });

    test("should return null if token is not found", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValue(null);

      const result = await getUserByForgotPasswordTokenRepository("invalid");

      expect(UserModel.findOne).toHaveBeenCalledWith({
        forgotPasswordToken: "invalid",
      });
      expect(result).toBeNull();
    });
  });

  describe("updatePasswordRepository", () => {
    test("should update password and clear forgotPasswordToken", async () => {
      const saveMock = vi.fn().mockResolvedValue(true);

      const mockUser = {
        _id: "123",
        password: "oldPass",
        forgotPasswordToken: "token123",
        save: saveMock,
      } as unknown as UserInterface.IUserModel;

      const result = await updatePasswordRepository(mockUser, "newPass");

      expect(mockUser.password).toBe("newPass");
      expect(mockUser.forgotPasswordToken).toBeNull();
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test("should propagate error if save fails", async () => {
      const saveMock = vi.fn().mockRejectedValue(new Error("save failed"));

      const mockUser = {
        _id: "123",
        password: "oldPass",
        forgotPasswordToken: "token123",
        save: saveMock,
      } as unknown as UserInterface.IUserModel;

      await expect(
        updatePasswordRepository(mockUser, "newPass"),
      ).rejects.toThrow("save failed");

      expect(mockUser.password).toBe("newPass");
      expect(mockUser.forgotPasswordToken).toBeNull();
      expect(saveMock).toHaveBeenCalled();
    });
  });
});
