import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";

import verifyWSRoles from "@/helpers/verify-ws-roles";

describe("verifyWSRoles", () => {
  let mockRequest: any;
  let mockSocket: any;
  let mockJwtVerify: any;

  beforeEach(() => {
    mockJwtVerify = vi.fn();
    mockRequest = {
      cookies: {},
      headers: {},
      server: {
        jwt: {
          verify: mockJwtVerify,
        },
      },
      i18n: {
        t: vi.fn((key) => key),
      },
      user: null,
    };
    mockSocket = {
      readyState: 1,
      send: vi.fn(),
      close: vi.fn(),
    };
  });

  test("should return false and close socket if token is not provided", () => {
    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        code: 4001,
        error: "error.handler.tokenNotProvided",
      }),
    );
    expect(mockSocket.close).toHaveBeenCalledWith(
      4001,
      "error.handler.tokenNotProvided",
    );
  });

  test("should return false and close socket if token is invalid", () => {
    mockRequest.cookies.accessToken = "invalid-token";
    mockJwtVerify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        code: 4002,
        error: "error.handler.tokenInvalid",
      }),
    );
    expect(mockSocket.close).toHaveBeenCalledWith(
      4002,
      "error.handler.tokenInvalid",
    );
  });

  test("should return false and close socket if user does not have required roles", () => {
    mockRequest.cookies.accessToken = "valid-token";
    mockJwtVerify.mockReturnValue({ roles: ["user"] });

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        code: 4003,
        error: "error.handler.unauthorized",
      }),
    );
    expect(mockSocket.close).toHaveBeenCalledWith(
      4003,
      "error.handler.unauthorized",
    );
  });

  test("should return true and set user if validation succeeds", () => {
    mockRequest.cookies.accessToken = "valid-token";
    const user = { roles: ["admin", "user"] };
    mockJwtVerify.mockReturnValue(user);

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(user);
    expect(mockSocket.send).not.toHaveBeenCalled();
    expect(mockSocket.close).not.toHaveBeenCalled();
  });

  test("should get token from authorization header if cookie is missing", () => {
    mockRequest.headers.authorization = "Bearer valid-token";
    const user = { roles: ["admin"] };
    mockJwtVerify.mockReturnValue(user);

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(user);
  });

  test("should not send message if socket is not open", () => {
    mockSocket.readyState = 2;
    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).not.toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalled();
  });
  test("should not send message if socket is not open and roles are missing", () => {
    mockRequest.cookies.accessToken = "valid-token";
    mockSocket.readyState = 2;
    mockJwtVerify.mockReturnValue({ roles: ["user"] });

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).not.toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalledWith(
      4003,
      "error.handler.unauthorized",
    );
  });

  test("should not send message if socket is not open and token is invalid", () => {
    mockRequest.cookies.accessToken = "invalid-token";
    mockSocket.readyState = 2;
    mockJwtVerify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).not.toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalledWith(
      4002,
      "error.handler.tokenInvalid",
    );
  });

  test("should handle JWT payload without roles property", () => {
    mockRequest.cookies.accessToken = "valid-token";
    mockJwtVerify.mockReturnValue({ userId: 123 });

    const verifier = verifyWSRoles(["admin"]);
    const result = verifier(
      mockRequest as FastifyRequest,
      mockSocket as WebSocket,
    );

    expect(result).toBe(false);
    expect(mockSocket.send).toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalledWith(
      4003,
      "error.handler.unauthorized",
    );
  });
});
