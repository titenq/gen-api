import fp from "fastify-plugin";
import Redis from "ioredis";

import env from "@/config/env";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = env;

const reviveDates = (obj: any) => {
  if (obj && typeof obj === "object") {
    if ("createdAt" in obj && typeof obj.createdAt === "string") {
      obj.createdAt = new Date(obj.createdAt);
    }

    if ("updatedAt" in obj && typeof obj.updatedAt === "string") {
      obj.updatedAt = new Date(obj.updatedAt);
    }
  }

  return obj;
};

const redisPlugin = fp(async (fastify) => {
  let redis: Redis | null = null;
  let redisConnected = false;

  try {
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      retryStrategy: () => null,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });

    let firstError = true;

    redis.on("error", () => {
      if (firstError) {
        firstError = false;
      }
      redisConnected = false;
    });

    await redis.connect();

    console.log("Redis connected successfully");
    redisConnected = true;
  } catch (_error) {
    console.error("Redis not available, continuing without cache");
    redis = null;
    redisConnected = false;
  }

  fastify.decorate("redis", redis);

  fastify.decorate("cache", async function <
    T,
  >(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    if (!redisConnected || !redis) {
      return await fetcher();
    }

    try {
      const cached = await redis.get(key);

      if (cached) {
        const parsed = JSON.parse(cached);
        return reviveDates(parsed) as T;
      }

      const data = await fetcher();

      if (!data || (typeof data === "object" && "error" in data)) {
        return data;
      }

      await redis.set(key, JSON.stringify(data), "EX", ttl);

      return data;
    } catch (_error) {
      return fetcher();
    }
  });

  fastify.addHook("onClose", () => {
    if (redis) {
      redis.disconnect();
    }
  });
});

export default redisPlugin;
