import { beforeEach, describe, expect, test, vi } from "vitest";

import redisService from "@/services/health/redis.service";
import { RedisStatus } from "@/enums/health.enum";

describe("redisService", () => {
  let fastify: any;

  beforeEach(() => {
    vi.clearAllMocks();
    fastify = {
      redis: {
        status: "ready",
        ping: vi.fn(),
      },
    };
  });

  test("should return DOWN when redis is not configured", async () => {
    fastify.redis = undefined;

    const result = await redisService(fastify);

    expect(result.status).toBe(RedisStatus.DOWN);
    expect(result.error).toBe("Redis not configured");
  });

  test("should return DOWN when redis status is not ready", async () => {
    fastify.redis.status = "connecting";

    const result = await redisService(fastify);

    expect(result.status).toBe(RedisStatus.DOWN);
    expect(result.error).toBe("Redis connection status: connecting");
  });

  test("should return DOWN when ping response is not PONG", async () => {
    fastify.redis.ping.mockResolvedValue("FAIL");

    const result = await redisService(fastify);

    expect(result.status).toBe(RedisStatus.DOWN);
    expect(result.error).toBe("Redis ping failed");
  });

  test("should return OK when ping response is PONG", async () => {
    fastify.redis.ping.mockResolvedValue("PONG");

    const result = await redisService(fastify);

    expect(result.status).toBe(RedisStatus.OK);
    expect(result.latency).toBeTypeOf("number");
    expect(fastify.redis.ping).toHaveBeenCalled();
  });

  test("should return DOWN when an exception occurs", async () => {
    fastify.redis.ping.mockRejectedValue(new Error("connection error"));

    const result = await redisService(fastify);

    expect(result.status).toBe(RedisStatus.DOWN);
    expect(result.error).toContain("Redis health check failed");
  });
});
