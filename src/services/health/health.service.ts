import { FastifyInstance } from "fastify";

import {
  MongoDBStatus,
  HealthStatus,
  RedisStatus,
  RabbitMQStatus,
} from "@/enums/health.enum";
import formatUptime from "@/helpers/format-uptime";
import getAppVersion from "@/helpers/get-app-version";
import { HealthInterface } from "@/interfaces";
import mongoDBService from "@/services/health/mongodb.service";
import redisService from "@/services/health/redis.service";
import rabbitMQService from "@/services/health/rabbitmq.service";

const healthService = async (
  fastify: FastifyInstance,
): Promise<HealthInterface.IHealthResponse> => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  const version = getAppVersion();

  try {
    const mongoHealth = await mongoDBService();
    const redisHealth = await redisService(fastify);
    const rabbitHealth = await rabbitMQService(fastify);

    const overallStatus =
      mongoHealth.status === MongoDBStatus.OK &&
      redisHealth.status === RedisStatus.OK &&
      rabbitHealth.status === RabbitMQStatus.OK
        ? HealthStatus.OK
        : HealthStatus.ERROR;

    return {
      status: overallStatus,
      timestamp,
      version,
      uptime: formatUptime(uptime),
      uptimeSeconds: uptime,
      dependencies: {
        mongoDB: mongoHealth,
        redis: redisHealth,
        rabbitMQ: rabbitHealth,
      },
    };
  } catch (_error) {
    return {
      status: HealthStatus.ERROR,
      timestamp,
      version,
      dependencies: {
        mongoDB: {
          status: MongoDBStatus.DOWN,
          error: "MongoDB connection failed",
        },
        redis: {
          status: RedisStatus.DOWN,
          error: "Redis connection failed",
        },
        rabbitMQ: {
          status: RabbitMQStatus.DOWN,
          error: "RabbitMQ connection failed",
        },
      },
    };
  }
};

export default healthService;
