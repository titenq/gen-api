import { z } from "zod";

import {
  MongoDBStatus,
  HealthStatus,
  RedisStatus,
  RabbitMQStatus,
} from "@/enums/health.enum";
import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const MongoDBStatusEnum = z.enum(MongoDBStatus, {
  error: "validation.mongoDBStatusEnum",
});

const RedisStatusEnum = z.enum(RedisStatus, {
  error: "validation.redisStatusEnum",
});

const RabbitMQStatusEnum = z.enum(RabbitMQStatus, {
  error: "validation.rabbitMQStatusEnum",
});

const HealthStatusEnum = z.enum(HealthStatus, {
  error: "validation.healthStatusEnum",
});

const healthMongoDBSchema = z.object({
  status: MongoDBStatusEnum,
  latency: z.number("validation.latency").optional(),
  error: z.string("validation.errorHealth").optional(),
});

const healthRedisSchema = z.object({
  status: RedisStatusEnum,
  latency: z.number("validation.latency").optional(),
  error: z.string("validation.errorHealth").optional(),
});

const healthRabbitMQSchema = z.object({
  status: RabbitMQStatusEnum,
  latency: z.number("validation.latency").optional(),
  error: z.string("validation.errorHealth").optional(),
});

const healthResponseSchema = z.object({
  status: HealthStatusEnum,
  timestamp: z.string("validation.timestamp"),
  version: z.string("validation.version"),
  uptime: z.string("validation.uptime"),
  uptimeSeconds: z.number("validation.uptimeSeconds"),
  dependencies: z.object({
    mongoDB: healthMongoDBSchema,
    redis: healthRedisSchema,
    rabbitMQ: healthRabbitMQSchema,
  }),
});

const healthSchema = {
  summary: translate("schema.summary.health"),
  tags: [translate("schema.tags.health")],
  response: {
    200: healthResponseSchema,
    429: sharedSchema.errorSchema,
    500: healthResponseSchema,
    503: healthResponseSchema,
  },
};

export { healthSchema };
