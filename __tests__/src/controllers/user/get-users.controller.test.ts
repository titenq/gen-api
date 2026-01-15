import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import getUsers from "@/controllers/user/get-users.controller";
import getUsersService from "@/services/user/get-users.service";
import errorHandler from "@/handlers/error.handler";
import { Roles } from "@/enums/user.enum";
import { ErrorInterface, UserInterface } from "@/interfaces";

vi.mock("@/services/user/get-users.service", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/handlers/error.handler", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockedGetUsersService = getUsersService as unknown as ReturnType<
  typeof vi.fn
>;
const mockedErrorHandler = errorHandler as unknown as ReturnType<typeof vi.fn>;

describe("getUsers controller", () => {
  let request: FastifyRequest<{ Querystring: UserInterface.IGetUsersQuery }>;
  let reply: FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();

    request = {
      query: {
        page: 1,
        limit: 10,
        role: Roles.USER,
      },
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as FastifyRequest<{
      Querystring: UserInterface.IGetUsersQuery;
    }>;

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;
  });

  test("should return users successfully", async () => {
    const mockUsers: UserInterface.IGetUsersResponse = {
      users: [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          roles: [Roles.USER],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalPages: 1,
      currentPage: 1,
      perPage: 50,
      totalCount: 50,
    };

    (mockedGetUsersService as any).mockResolvedValue(mockUsers);

    await getUsers(request, reply);

    expect(mockedGetUsersService).toHaveBeenCalledWith(request.query);
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(mockUsers);
  });

  test("should handle error response", async () => {
    const mockError: ErrorInterface.IGenericError = {
      error: true,
      message: "Failed to get users",
      statusCode: 500,
    };

    (mockedGetUsersService as any).mockResolvedValue(mockError);

    await getUsers(request, reply);

    expect(mockedErrorHandler).toHaveBeenCalledWith(mockError, request, reply);
  });
});
