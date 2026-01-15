import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

import preSerializationHook from "@/hooks/pre-serialization.hook";

describe("preSerializationHook", () => {
  let mockFastify: any;
  let mockRequest: any;
  let mockReply: any;
  let hookHandler: any;

  beforeEach(() => {
    mockFastify = {
      addHook: vi.fn((hookName, handler) => {
        hookHandler = handler;
      }),
    };

    mockRequest = {
      headers: {},
      routeOptions: {
        schema: {
          response: {},
        },
      },
      i18n: {
        t: vi.fn((key) => `translated_${key}`),
      },
    };

    mockReply = {
      statusCode: 200,
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  test("should register preSerialization hook", () => {
    preSerializationHook(mockFastify as FastifyInstance);
    expect(mockFastify.addHook).toHaveBeenCalledWith(
      "preSerialization",
      expect.any(Function),
    );
  });

  test("should return payload if accept header includes application/x-protobuf", async () => {
    preSerializationHook(mockFastify as FastifyInstance);
    mockRequest.headers.accept = "application/x-protobuf";

    const payload = { data: "test" };

    const result = await hookHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
      payload,
    );

    expect(result).toBe(payload);
  });

  test("should validate payload if schema is present", async () => {
    preSerializationHook(mockFastify as FastifyInstance);

    const schema = z.object({ data: z.string() });
    mockRequest.routeOptions.schema.response[200] = schema;
    const payload = { data: "test" };

    const result = await hookHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
      payload,
    );

    expect(result).toEqual(payload);
  });

  test("should return payload if no schema is present", async () => {
    preSerializationHook(mockFastify as FastifyInstance);

    const payload = { data: "test" };

    const result = await hookHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
      payload,
    );

    expect(result).toBe(payload);
  });

  test("should handle ZodError with validation message (400)", async () => {
    preSerializationHook(mockFastify as FastifyInstance);

    const schema = z.object({
      data: z.string().refine(() => false, { message: "validation.error" }),
    });
    mockRequest.routeOptions.schema.response[200] = schema;

    const payload = { data: "test" };

    await hookHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
      payload,
    );

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: true,
      message: "translated_validation.error",
      statusCode: 400,
    });
  });

  test("should handle ZodError without validation message (500)", async () => {
    preSerializationHook(mockFastify as FastifyInstance);

    const schema = z.object({
      data: z.string().refine(() => false, { message: "internal.error" }),
    });
    mockRequest.routeOptions.schema.response[200] = schema;

    const payload = { data: "test" };

    await hookHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
      payload,
    );

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: true,
      message: "translated_error.handler.responseSerializationError",
      statusCode: 500,
    });
  });

  test("should rethrow non-Zod errors", async () => {
    preSerializationHook(mockFastify as FastifyInstance);

    const error = new Error("Generic error");
    mockRequest.routeOptions.schema.response[200] = {
      parse: () => {
        throw error;
      },
    };

    const payload = { data: "test" };

    await expect(
      hookHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
        payload,
      ),
    ).rejects.toThrow(error);
  });
});
