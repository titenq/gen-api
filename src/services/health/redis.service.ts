import { FastifyInstance } from "fastify";

import { HealthInterface } from "@/interfaces";
import { RedisStatus } from "@/enums/health.enum";
import translate from "@/helpers/translate";

const redisService = async (
  fastify: FastifyInstance,
): Promise<HealthInterface.IHealthRedis> => {
  if (!fastify.redis) {
    return {
      status: RedisStatus.DOWN,
      error: translate("message.redis.notConfigured"),
    };
  }

  try {
    if (fastify.redis.status !== "ready") {
      return {
        status: RedisStatus.DOWN,
        error: translate("message.redis.connectionStatus", {
          status: fastify.redis.status,
        }),
      };
    }

    const start = Date.now();
    const response = await fastify.redis.ping();
    const latency = Date.now() - start;

    if (response !== "PONG") {
      return {
        status: RedisStatus.DOWN,
        error: translate("message.redis.pingFailed"),
      };
    }

    return {
      status: RedisStatus.OK,
      latency,
    };
  } catch (error) {
    return {
      status: RedisStatus.DOWN,
      error: translate("message.redis.healthCheckFailed", {
        error: String(error),
      }),
    };
  }
};

export default redisService;
