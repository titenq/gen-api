import { describe, test, expect, vi, beforeEach } from "vitest";

import getUserByEmailService from "@/services/user/get-user-by-email.service";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";
import createErrorMessage from "@/helpers/create-error-message";

vi.mock("@/repositories/user/get-user-by-email.repository");
vi.mock("@/helpers/create-error-message");

describe("getUserByEmailService", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return user when user is found", async () => {
    const mockUser = { _id: "1", email: mockEmail, name: "John Doe" };
    (
      getUserByEmailRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUser);

    const result = await getUserByEmailService(mockEmail);

    expect(getUserByEmailRepository).toHaveBeenCalledWith(mockEmail);
    expect(result).toEqual(mockUser);
  });

  test("should return error message when user is not found", async () => {
    (
      getUserByEmailRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const mockError = { error: "error.user.notFound", statusCode: 404 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByEmailService(mockEmail);

    expect(getUserByEmailRepository).toHaveBeenCalledWith(mockEmail);
    expect(createErrorMessage).toHaveBeenCalledWith("error.user.notFound", 404);
    expect(result).toEqual(mockError);
  });

  test("should return error message when an exception occurs", async () => {
    (
      getUserByEmailRepository as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("DB error"));
    const mockError = { error: "error.user.getUserByEmail", statusCode: 400 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByEmailService(mockEmail);

    expect(getUserByEmailRepository).toHaveBeenCalledWith(mockEmail);
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.user.getUserByEmail",
      400,
    );
    expect(result).toEqual(mockError);
  });
});
