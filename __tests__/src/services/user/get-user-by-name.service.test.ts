import { describe, test, expect, vi, beforeEach } from "vitest";

import getUserByNameService from "@/services/user/get-user-by-name.service";
import getUserByNameRepository from "@/repositories/user/get-user-by-name.repository";
import createErrorMessage from "@/helpers/create-error-message";

vi.mock("@/repositories/user/get-user-by-name.repository");
vi.mock("@/helpers/create-error-message");

describe("getUserByNameService", () => {
  const mockName = "John Doe";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return user when user is found", async () => {
    const mockUser = { _id: "1", name: mockName, email: "john@example.com" };
    (
      getUserByNameRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUser);

    const result = await getUserByNameService(mockName);

    expect(getUserByNameRepository).toHaveBeenCalledWith(mockName);
    expect(result).toEqual(mockUser);
  });

  test("should return error message when user is not found", async () => {
    (
      getUserByNameRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const mockError = { error: "error.user.notFound", statusCode: 404 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByNameService(mockName);

    expect(getUserByNameRepository).toHaveBeenCalledWith(mockName);
    expect(createErrorMessage).toHaveBeenCalledWith("error.user.notFound", 404);
    expect(result).toEqual(mockError);
  });

  test("should return error message when an exception occurs", async () => {
    (
      getUserByNameRepository as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("DB error"));
    const mockError = { error: "error.user.getUserByName", statusCode: 400 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUserByNameService(mockName);

    expect(getUserByNameRepository).toHaveBeenCalledWith(mockName);
    expect(createErrorMessage).toHaveBeenCalledWith(
      "error.user.getUserByName",
      400,
    );
    expect(result).toEqual(mockError);
  });
});
