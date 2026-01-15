import { describe, test, expect, vi, beforeEach } from "vitest";

import getUsersService from "@/services/user/get-users.service";
import getUsersRepository from "@/repositories/user/get-users.repository";
import { buildQuery, buildResponse } from "@/helpers/response-pagination";
import createErrorMessage from "@/helpers/create-error-message";

vi.mock("@/repositories/user/get-users.repository");
vi.mock("@/helpers/response-pagination");
vi.mock("@/helpers/create-error-message");

describe("getUsersService", () => {
  const mockQueryString = {
    page: 1,
    limit: 10,
    filterBy: "createdAt",
    orderBy: "desc" as const,
    key: "name",
    value: "John",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return paginated users when repository succeeds", async () => {
    const mockQuery = { name: "John" };
    const mockUsers = [{ _id: "1", name: "John Doe" }];
    const mockCount = 1;
    const mockResponse = {
      data: mockUsers,
      total: mockCount,
      page: 1,
      limit: 10,
    };

    (buildQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockQuery,
    );
    (
      getUsersRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      resources: mockUsers,
      count: mockCount,
    });
    (buildResponse as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockResponse,
    );

    const result = await getUsersService(mockQueryString);

    expect(buildQuery).toHaveBeenCalledWith("name", "John");
    expect(getUsersRepository).toHaveBeenCalledWith({
      query: mockQuery,
      page: 1,
      limit: 10,
      filterBy: "createdAt",
      orderBy: "desc",
    });
    expect(buildResponse).toHaveBeenCalledWith(
      "users",
      mockUsers,
      mockCount,
      1,
      10,
    );
    expect(result).toEqual(mockResponse);
  });

  test("should use default pagination values when page and limit are not provided", async () => {
    const queryWithoutPagination = { key: "email", value: "john@example.com" };
    const mockQuery = { email: "john@example.com" };
    const mockUsers = [{ _id: "2", name: "John Doe" }];
    const mockCount = 5;
    const mockResponse = {
      data: mockUsers,
      total: mockCount,
      page: 1,
      limit: 50,
    };

    (buildQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockQuery,
    );
    (
      getUsersRepository as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      resources: mockUsers,
      count: mockCount,
    });
    (buildResponse as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockResponse,
    );

    const result = await getUsersService(queryWithoutPagination as any);

    expect(buildQuery).toHaveBeenCalledWith("email", "john@example.com");
    expect(getUsersRepository).toHaveBeenCalledWith({
      query: mockQuery,
      page: 1,
      limit: 50,
      filterBy: "createdAt",
      orderBy: "desc",
    });
    expect(buildResponse).toHaveBeenCalledWith(
      "users",
      mockUsers,
      mockCount,
      1,
      50,
    );
    expect(result).toEqual(mockResponse);
  });

  test("should return error message when an exception occurs", async () => {
    (buildQuery as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error("Unexpected error");
      },
    );
    const mockError = { error: "error.user.getUsers", statusCode: 500 };
    (createErrorMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockError,
    );

    const result = await getUsersService(mockQueryString);

    expect(createErrorMessage).toHaveBeenCalledWith("error.user.getUsers", 500);
    expect(result).toEqual(mockError);
  });
});
