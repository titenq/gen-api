import { beforeEach, describe, test, expect, vi } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import getUserById from "@/controllers/user/get-user-by-id.controller";
import { CACHE_TTL } from "@/constants/constants";
import { Roles } from "@/enums/user.enum";
import { UserInterface, ErrorInterface } from "@/interfaces";

vi.mock("@/services/user/get-user-by-id.service", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/helpers/create-error-message", () => ({
  __esModule: true,
  default: vi.fn(() => ({
    error: true,
    message: "validation.getUserById",
    statusCode: 500,
  })),
}));

vi.mock("@/handlers/error.handler", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const getUserByIdService = (
  await import("@/services/user/get-user-by-id.service")
).default as ReturnType<typeof vi.fn>;

const createErrorMessage = (await import("@/helpers/create-error-message"))
  .default as ReturnType<typeof vi.fn>;

const errorHandler = (await import("@/handlers/error.handler"))
  .default as ReturnType<typeof vi.fn>;

describe("getUserById controller", () => {
  let request: FastifyRequest<{ Params: UserInterface.IGetUserByIdParams }>;
  let reply: FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();

    const cacheMock = vi.fn(
      async (
        key: string,
        ttl: number,
        fn: () => Promise<
          UserInterface.IGetUserByIdResponse | ErrorInterface.IGenericError
        >,
        _req: FastifyRequest<{ Params: UserInterface.IGetUserByIdParams }>,
      ): Promise<
        UserInterface.IGetUserByIdResponse | ErrorInterface.IGenericError
      > => {
        return await fn();
      },
    );

    request = {
      params: { id: "123" },
      server: { cache: cacheMock },
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as FastifyRequest<{
      Params: UserInterface.IGetUserByIdParams;
    }>;

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      protobufType: "",
    } as unknown as FastifyReply;
  });

  test("should return user when found", async () => {
    const mockUser: UserInterface.IGetUserByIdResponse = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      roles: [Roles.USER],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (getUserByIdService as any).mockResolvedValueOnce(mockUser);

    await getUserById(request, reply);

    expect(request.server.cache).toHaveBeenCalledWith(
      "user:123",
      CACHE_TTL,
      expect.any(Function),
      request,
    );
    expect(getUserByIdService).toHaveBeenCalledWith("123");
    expect(reply.protobufType).toBe("user.GetUserByIdResponse");
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(mockUser);
  });

  test("should handle error response", async () => {
    const mockError: ErrorInterface.IGenericError = {
      error: true,
      message: "User not found",
      statusCode: 404,
    };

    (request.server.cache as any) = vi.fn(async () => mockError);

    await getUserById(request, reply);

    expect(reply.protobufType).toBe("error.GenericError");
    expect(errorHandler).toHaveBeenCalledWith(mockError, request, reply);
  });

  test("should handle exception and call createErrorMessage", async () => {
    (request.server.cache as any) = vi.fn(async () => {
      throw new Error("cache error");
    });

    await getUserById(request, reply);

    expect(createErrorMessage).toHaveBeenCalledWith(
      "validation.getUserById",
      500,
    );
    expect(reply.protobufType).toBe("error.GenericError");
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "validation.getUserById",
        statusCode: 500,
      }),
      request,
      reply,
    );
  });
});
