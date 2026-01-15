import { vi, describe, beforeEach, test, expect } from "vitest";

import { Roles } from "@/enums/user.enum";
import { RepositoryInterface, UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";
import getUsers from "@/repositories/user/get-users.repository";
import { executeQuery } from "@/helpers/response-pagination";

vi.mock("@/helpers/response-pagination", () => ({
  executeQuery: vi.fn(),
}));

describe("get-user.repository", () => {
  const mockUsers: UserInterface.IUserResponseModified[] = [
    {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      roles: [Roles.USER],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: true,
    },
    {
      _id: "456",
      name: "Jane Smith",
      email: "jane@example.com",
      roles: [Roles.ADMIN],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
    },
  ];

  const mockParams: RepositoryInterface.IGetAllRepositoryParams = {
    query: {},
    page: 1,
    limit: 10,
    filterBy: "name",
    orderBy: "asc",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return users with resources and count", async () => {
    const executeQueryMock: { mockResolvedValue: (value: any) => void } =
      executeQuery as unknown as any;

    executeQueryMock.mockResolvedValue({
      resources: mockUsers,
      count: mockUsers.length,
    });

    const result = await getUsers(mockParams);

    expect(executeQuery).toHaveBeenCalledWith(
      UserModel,
      mockParams.query,
      mockParams.page,
      mockParams.limit,
      mockParams.filterBy,
      mockParams.orderBy,
    );

    expect(result).toEqual({
      resources: mockUsers,
      count: mockUsers.length,
    });
  });

  test("should return empty resources and count 0 if no users found", async () => {
    const executeQueryMock: { mockResolvedValue: (value: any) => void } =
      executeQuery as unknown as any;

    executeQueryMock.mockResolvedValue({
      resources: [],
      count: 0,
    });

    const result = await getUsers(mockParams);

    expect(result).toEqual({
      resources: [],
      count: 0,
    });
  });
});
