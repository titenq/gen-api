import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { Types } from "mongoose";

import loginController from "@/controllers/auth/login.controller";
import { Roles } from "@/enums/user.enum";
import { AuthInterface, UserInterface, ErrorInterface } from "@/interfaces";
import loginService from "@/services/auth/login.service";

vi.mock("@/services/auth/login.service");
vi.mock("@/handlers/error.handler", () => ({
  default: vi.fn(
    (response: ErrorInterface.IGenericError, _req: any, reply: any) => {
      return reply.status(response.statusCode).send(response);
    },
  ),
}));

describe("loginController", () => {
  const mockedUser: UserInterface.IUserResponse = {
    _id: new Types.ObjectId(),
    email: "test@test.com",
    password: "hashedPassword1!",
    roles: [Roles.USER],
    isEmailVerified: true,
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReply = {
      jwtSign: vi.fn().mockResolvedValue("token"),
      setCookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  const makeRequest = (
    body: AuthInterface.ILoginBody,
    headers?: AuthInterface.ILoginHeaders,
  ) =>
    ({
      body,
      headers: headers || {},
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    }) as unknown as FastifyRequest<{
      Body: AuthInterface.ILoginBody;
      Headers: AuthInterface.ILoginHeaders;
    }>;

  test("should return 200 and set cookies if login is successful", async () => {
    vi.mocked(loginService).mockResolvedValue(mockedUser);

    await loginController(
      makeRequest({ email: "test@test.com", password: "Password123!" }),
      mockReply as FastifyReply,
    );

    expect(mockReply.jwtSign).toHaveBeenCalledTimes(2);
    expect(mockReply.setCookie).toHaveBeenCalledTimes(2);
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockedUser);
  });

  test("should call errorHandler if loginService returns an error", async () => {
    const mockError: ErrorInterface.IGenericError = {
      error: true,
      message: "Some error",
      statusCode: 401,
    };

    vi.mocked(loginService).mockResolvedValue(mockError);

    await loginController(
      makeRequest({ email: "test@test.com", password: "Password123!" }),
      mockReply as FastifyReply,
    );

    expect(mockReply.status).toHaveBeenCalledWith(mockError.statusCode);
    expect(mockReply.send).toHaveBeenCalledWith(mockError);
  });
});
