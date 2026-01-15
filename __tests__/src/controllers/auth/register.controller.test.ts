import { describe, test, expect, vi } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthInterface } from "@/interfaces";
import register from "@/controllers/auth/register.controller";
import registerService from "@/services/auth/register.service";
import errorHandler from "@/handlers/error.handler";
import { Roles } from "@/enums/user.enum";

vi.mock("@/services/auth/register.service");
vi.mock("@/handlers/error.handler");

describe("register controller", () => {
  test("should return 201 and response when registerService succeeds", async () => {
    const mockResponse = {
      _id: "123",
      name: "Test User",
      email: "user@test.com",
      roles: [Roles.USER],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(registerService).mockResolvedValue(mockResponse);

    const request: FastifyRequest<{
      Body: AuthInterface.IRegisterBody;
      Headers: AuthInterface.IRegisterHeaders;
    }> = {
      body: { email: "user@test.com", password: "123456" },
      headers: { "x-recaptcha-token": "fake-token" },
      server: {} as any,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      i18n: {
        t: vi.fn((key) => key),
      },
    } as any;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await register(request, reply);

    expect(registerService).toHaveBeenCalledWith(request.server, request.body);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should call errorHandler when registerService returns error", async () => {
    const errorResponse = {
      error: true,
      message: "User already exists",
      statusCode: 400,
    };
    vi.mocked(registerService).mockResolvedValue(errorResponse);

    const request: FastifyRequest<{
      Body: AuthInterface.IRegisterBody;
      Headers: AuthInterface.IRegisterHeaders;
    }> = {
      body: { email: "user@test.com", password: "123456" },
      headers: { "x-recaptcha-token": "fake-token" },
      server: {} as any,
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      i18n: {
        t: vi.fn((key) => key),
      },
    } as any;

    const reply = {} as unknown as FastifyReply;

    await register(request, reply);

    expect(errorHandler).toHaveBeenCalledWith(errorResponse, request, reply);
  });
});
