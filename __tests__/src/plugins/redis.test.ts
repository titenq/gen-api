import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import Redis from "ioredis";

import redisPlugin from "@/plugins/redis";

vi.mock("ioredis", () => {
  const Redis = vi.fn();
  Redis.prototype.status = "connecting";
  Redis.prototype.connect = vi.fn().mockResolvedValue(undefined);
  Redis.prototype.on = vi.fn();
  Redis.prototype.get = vi.fn();
  Redis.prototype.set = vi.fn();
  Redis.prototype.disconnect = vi.fn();
  Redis.prototype.duplicate = vi.fn().mockReturnThis();

  return { default: Redis };
});

vi.mock("@/config/env", () => ({
  default: {
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    REDIS_PASSWORD: "password",
  },
}));

describe("redisPlugin", () => {
  let mockFastify: any;
  let hooks: Record<string, Function>;
  let connectSpy: any;
  let onSpy: any;
  let getSpy: any;
  let setSpy: any;
  let disconnectSpy: any;

  beforeEach(() => {
    hooks = {};

    connectSpy = vi
      .spyOn(Redis.prototype, "connect")
      .mockResolvedValue(undefined);
    onSpy = vi.spyOn(Redis.prototype, "on");
    getSpy = vi.spyOn(Redis.prototype, "get");
    setSpy = vi.spyOn(Redis.prototype, "set");
    disconnectSpy = vi.spyOn(Redis.prototype, "disconnect");

    mockFastify = {
      decorate: vi.fn(),
      addHook: vi.fn((name, handler) => {
        hooks[name] = handler;
      }),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should connect to Redis and decorate fastify", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    expect(connectSpy).toHaveBeenCalled();
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "redis",
      expect.any(Object),
    );
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "cache",
      expect.any(Function),
    );
    expect(mockFastify.addHook).toHaveBeenCalledWith(
      "onClose",
      expect.any(Function),
    );
  });

  test("should handle connection error gracefully", async () => {
    connectSpy.mockRejectedValue(new Error("Connection failed"));

    await redisPlugin(mockFastify as FastifyInstance);

    expect(mockFastify.decorate).toHaveBeenCalledWith("redis", null);
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "cache",
      expect.any(Function),
    );
  });

  test("should use cache if available", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];

    const cachedData = { data: "test", createdAt: "2023-01-01T00:00:00.000Z" };

    getSpy.mockResolvedValue(JSON.stringify(cachedData));

    const fetcher = vi.fn();
    const result = await cache("key", 60, fetcher);

    expect(getSpy).toHaveBeenCalledWith("key");
    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: "test",
      createdAt: new Date("2023-01-01T00:00:00.000Z"),
    });
  });

  test("should fetch and cache data if not in cache", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];

    getSpy.mockResolvedValue(null);

    const data = { data: "test" };
    const fetcher = vi.fn().mockResolvedValue(data);
    const result = await cache("key", 60, fetcher);

    expect(getSpy).toHaveBeenCalledWith("key");
    expect(fetcher).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith("key", JSON.stringify(data), "EX", 60);
    expect(result).toEqual(data);
  });

  test("should not cache if data is error or null", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];

    getSpy.mockResolvedValue(null);

    const fetcher = vi.fn().mockResolvedValue({ error: true });

    await cache("key", 60, fetcher);

    expect(setSpy).not.toHaveBeenCalled();
  });

  test("should fallback to fetcher if redis fails", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];

    getSpy.mockRejectedValue(new Error("Redis error"));

    const data = { data: "test" };
    const fetcher = vi.fn().mockResolvedValue(data);
    const result = await cache("key", 60, fetcher);

    expect(fetcher).toHaveBeenCalled();
    expect(result).toEqual(data);
  });

  test("should fallback to fetcher if redis is not connected", async () => {
    connectSpy.mockRejectedValue(new Error("Connection failed"));

    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];
    const data = { data: "test" };
    const fetcher = vi.fn().mockResolvedValue(data);
    const result = await cache("key", 60, fetcher);

    expect(getSpy).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalled();
    expect(result).toEqual(data);
  });

  test("should disconnect redis on close", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const onClose = hooks["onClose"];

    onClose();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("should revive updatedAt date from cache", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];
    const cachedData = { data: "test", updatedAt: "2023-01-01T00:00:00.000Z" };

    getSpy.mockResolvedValue(JSON.stringify(cachedData));

    const fetcher = vi.fn();
    const result = await cache("key", 60, fetcher);

    expect(result).toEqual({
      data: "test",
      updatedAt: new Date("2023-01-01T00:00:00.000Z"),
    });
  });

  test("should handle redis error event", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const errorCallback = onSpy.mock.calls.find(
      (call: any) => call[0] === "error",
    )[1];

    errorCallback(new Error("Redis error"));

    expect(onSpy).toHaveBeenCalledWith("error", expect.any(Function));
  });

  test("should have correct retryStrategy", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    expect(connectSpy).toHaveBeenCalled();
  });

  test("should configure redis with correct options", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "localhost",
        port: 6379,
        password: "password",
        enableOfflineQueue: false,
        maxRetriesPerRequest: 0,
        lazyConnect: true,
      }),
    );

    const options = (Redis as any).mock.calls[0][0];
    expect(options.retryStrategy()).toBeNull();
  });

  test("should handle non-object data in cache for reviveDates coverage", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const cache = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "cache",
    )[1];

    getSpy.mockResolvedValue("123");

    const result = await cache("key", 60, vi.fn());
    expect(result).toBe(123);
  });

  test("should handle multiple error events for firstError coverage", async () => {
    await redisPlugin(mockFastify as FastifyInstance);

    const errorCallback = onSpy.mock.calls.find(
      (call: any) => call[0] === "error",
    )[1];

    errorCallback(new Error("First error"));
    errorCallback(new Error("Second error"));

    expect(onSpy).toHaveBeenCalledWith("error", expect.any(Function));
  });

  test("should handle onClose when redis is null", async () => {
    connectSpy.mockRejectedValue(new Error("Connection failed"));
    await redisPlugin(mockFastify as FastifyInstance);

    const onClose = hooks["onClose"];
    onClose();

    expect(disconnectSpy).not.toHaveBeenCalled();
  });
});
