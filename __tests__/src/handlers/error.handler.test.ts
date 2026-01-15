import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import { ErrorInterface } from "@/interfaces";

describe("src/handlers/error.handler.ts", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      i18n: {
        t: vi.fn((key: string) => key),
      },
    } as any;

    mockReply = {
      sent: false,
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  test("should return early if reply is already sent", () => {
    mockReply.sent = true;
    errorHandler(
      new Error(),
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  test("should handle validation errors", () => {
    const error = {
      validation: [
        { message: "validation.error1" },
        { message: "some other error" },
      ],
    };

    errorHandler(
      error as any,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockRequest.i18n?.t).toHaveBeenCalledWith("validation.error1");
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: true,
      message: "validation.error1 | some other error",
      statusCode: 400,
    });
  });

  test("should handle generic errors with statusCode", () => {
    const error: ErrorInterface.IGenericError = {
      error: true,
      message: "error.generic",
      statusCode: 401,
    };

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockRequest.i18n?.t).toHaveBeenCalledWith("error.generic");
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith(error);
  });

  test("should handle fallback errors (unknown errors)", () => {
    const error = new Error("Unknown error");

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockRequest.i18n?.t).toHaveBeenCalledWith(
      "error.handler.internalServerError",
    );
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: true,
      message: "error.handler.internalServerError",
      statusCode: 500,
    });
  });

  test("should set protobufType if Accept header includes application/x-protobuf", () => {
    mockRequest.headers = { accept: "application/x-protobuf" };
    const error = new Error("Unknown error");

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.protobufType).toBe("error.GenericError");
    expect(mockReply.status).toHaveBeenCalledWith(500);
  });

  test("should set protobufType for validation errors if Accept header includes application/x-protobuf", () => {
    mockRequest.headers = { accept: "application/x-protobuf" };
    const error = {
      validation: [{ message: "validation.error" }],
    };

    errorHandler(
      error as any,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.protobufType).toBe("error.GenericError");
    expect(mockReply.status).toHaveBeenCalledWith(400);
  });

  test("should set protobufType for generic errors if Accept header includes application/x-protobuf", () => {
    mockRequest.headers = { accept: "application/x-protobuf" };
    const error: ErrorInterface.IGenericError = {
      error: true,
      message: "error.generic",
      statusCode: 403,
    };

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.protobufType).toBe("error.GenericError");
    expect(mockReply.status).toHaveBeenCalledWith(403);
  });
});
