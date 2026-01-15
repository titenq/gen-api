import { beforeEach, describe, expect, test, vi } from "vitest";

import rabbitMQService from "@/services/health/rabbitmq.service";
import { RabbitMQStatus } from "@/enums/health.enum";

describe("rabbitMQService", () => {
  let fastify: any;

  beforeEach(() => {
    vi.clearAllMocks();
    fastify = {
      rabbitMQ: {
        connection: {
          createChannel: vi.fn(),
        },
      },
    };
  });

  test("should return DOWN when rabbitMQ is not configured", async () => {
    fastify.rabbitMQ = undefined;

    const result = await rabbitMQService(fastify);

    expect(result.status).toBe(RabbitMQStatus.DOWN);
    expect(result.error).toBe("RabbitMQ not configured");
  });

  test("should return DOWN when connection is missing", async () => {
    fastify.rabbitMQ.connection = null;

    const result = await rabbitMQService(fastify);

    expect(result.status).toBe(RabbitMQStatus.DOWN);
    expect(result.error).toBe("RabbitMQ connection is closed");
  });

  test("should return OK when channel operations succeed", async () => {
    const mockChannel = {
      assertQueue: vi.fn().mockResolvedValue({ queue: "temp-queue" }),
      deleteQueue: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    fastify.rabbitMQ.connection.createChannel.mockResolvedValue(mockChannel);

    const result = await rabbitMQService(fastify);

    expect(result.status).toBe(RabbitMQStatus.OK);
    expect(result.latency).toBeTypeOf("number");
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("", {
      exclusive: true,
      autoDelete: true,
    });
    expect(mockChannel.deleteQueue).toHaveBeenCalledWith("temp-queue");
    expect(mockChannel.close).toHaveBeenCalled();
  });

  test("should return DOWN when an error occurs", async () => {
    fastify.rabbitMQ.connection.createChannel.mockRejectedValue(
      new Error("connection failed"),
    );

    const result = await rabbitMQService(fastify);

    expect(result.status).toBe(RabbitMQStatus.DOWN);
    expect(result.error).toBe("RabbitMQ connection failed");
  });
});
