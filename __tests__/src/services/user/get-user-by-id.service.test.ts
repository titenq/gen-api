import { describe, test, expect, vi, beforeEach } from "vitest";

import getUserByIdService from "@/services/user/get-user-by-id.service";
import getUserByIdRepository from "@/repositories/user/get-user-by-id.repository";
import createErrorMessage from "@/helpers/create-error-message";

vi.mock("@/repositories/user/get-user-by-id.repository");
vi.mock("@/helpers/create-error-message");

describe("getUserByIdService", () => {
  const mockId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return user when user is found", async () => {
    const mockUser = {
      _id: mockId,
      name: "John Doe",
      email: "john@example.com",
    };
    (
      getUserByIdRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUser);

    const result = await getUserByIdService(mockId);

    expect(getUserByIdRepository).toHaveBeenCalledWith(mockId);
    expect(result).toEqual(mockUser);
  });

  test("should return error message when user is not found", async () => {
    (
      getUserByIdRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const mockError = { error: "error.user.notFound", statusCode: 404 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByIdService(mockId);

    expect(getUserByIdRepository).toHaveBeenCalledWith(mockId);
    expect(createErrorMessage).toHaveBeenCalledWith("error.user.notFound", 404);
    expect(result).toEqual(mockError);
  });

  test("should return error message when an exception occurs", async () => {
    (
      getUserByIdRepository as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("DB error"));
    const mockError = { error: "error.user.getUserById", statusCode: 500 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByIdService(mockId);

    expect(getUserByIdRepository).toHaveBeenCalledWith(mockId);
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.user.getUserById",
      500,
    );
    expect(result).toEqual(mockError);
  });
});
