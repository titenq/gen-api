import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import healthService from "@/services/health/health.service";
import {
  HealthStatus,
  MongoDBStatus,
  RedisStatus,
  RabbitMQStatus,
} from "@/enums/health.enum";
import formatUptime from "@/helpers/format-uptime";
import getAppVersion from "@/helpers/get-app-version";
import mongoDBService from "@/services/health/mongodb.service";
import redisService from "@/services/health/redis.service";
import rabbitMQService from "@/services/health/rabbitmq.service";

vi.mock("@/helpers/format-uptime", () => ({
  __esModule: true,
  default: vi.fn(() => "1h 2m 3s"),
}));

vi.mock("@/helpers/get-app-version", () => ({
  __esModule: true,
  default: vi.fn(() => "1.0.0"),
}));

vi.mock("@/services/health/mongodb.service", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/services/health/redis.service", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/services/health/rabbitmq.service", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockedMongoDBService = mongoDBService as unknown as ReturnType<
  typeof vi.fn
>;
const mockedRedisService = redisService as unknown as ReturnType<typeof vi.fn>;
const mockedRabbitMQService = rabbitMQService as unknown as ReturnType<
  typeof vi.fn
>;
const mockedFormatUptime = formatUptime as unknown as ReturnType<typeof vi.fn>;
const mockedGetAppVersion = getAppVersion as unknown as ReturnType<
  typeof vi.fn
>;

describe("healthService", () => {
  let fastify: FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    fastify = {} as FastifyInstance;
  });

  test("should return OK health response when all dependencies are healthy", async () => {
    (mockedMongoDBService as any).mockResolvedValue({
      status: MongoDBStatus.OK,
    });
    (mockedRedisService as any).mockResolvedValue({ status: RedisStatus.OK });
    (mockedRabbitMQService as any).mockResolvedValue({
      status: RabbitMQStatus.OK,
    });

    const result = await healthService(fastify);

    expect(mockedMongoDBService).toHaveBeenCalled();
    expect(mockedRedisService).toHaveBeenCalledWith(fastify);
    expect(mockedRabbitMQService).toHaveBeenCalledWith(fastify);
    expect(mockedGetAppVersion).toHaveBeenCalled();
    expect(mockedFormatUptime).toHaveBeenCalledWith(expect.any(Number));

    expect(result.status).toBe(HealthStatus.OK);
    expect(result.version).toBe("1.0.0");
    expect(result.dependencies.mongoDB.status).toBe(MongoDBStatus.OK);
    expect(result.dependencies.redis.status).toBe(RedisStatus.OK);
    expect(result.dependencies.rabbitMQ.status).toBe(RabbitMQStatus.OK);
  });

  test("should return ERROR health response when any dependency fails", async () => {
    (mockedMongoDBService as any).mockResolvedValue({
      status: MongoDBStatus.OK,
    });
    (mockedRedisService as any).mockResolvedValue({ status: RedisStatus.DOWN });
    (mockedRabbitMQService as any).mockResolvedValue({
      status: RabbitMQStatus.OK,
    });

    const result = await healthService(fastify);

    expect(result.status).toBe(HealthStatus.ERROR);
    expect(result.dependencies.redis.status).toBe(RedisStatus.DOWN);
  });

  test("should return ERROR health response when an exception is thrown", async () => {
    (mockedMongoDBService as any).mockRejectedValue(
      new Error("Connection failed"),
    );

    const result = await healthService(fastify);

    expect(result.status).toBe(HealthStatus.ERROR);
    expect(result.dependencies.mongoDB.status).toBe(MongoDBStatus.DOWN);
    expect(result.dependencies.redis.status).toBe(RedisStatus.DOWN);
    expect(result.dependencies.rabbitMQ.status).toBe(RabbitMQStatus.DOWN);
    expect(result.dependencies.mongoDB.error).toBe("MongoDB connection failed");
  });
});
