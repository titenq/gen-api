import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import * as amqp from "amqplib";

import rabbitMQPlugin, { RabbitMQPluginOptions } from "@/plugins/rabbitmq";

vi.mock("amqplib");
vi.mock("@/config/env", () => ({
  default: {
    RABBITMQ_USER: "user",
    RABBITMQ_PASSWORD: "password",
  },
}));
vi.mock("@/consumers/forgot-password.consumer", () => ({
  default: vi.fn(),
}));
vi.mock("@/consumers/verification-email.consumer", () => ({
  default: vi.fn(),
}));

describe("rabbitMQPlugin", () => {
  let mockFastify: any;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      assertQueue: vi.fn().mockResolvedValue({}),
      sendToQueue: vi.fn(),
      consume: vi.fn(),
      ack: vi.fn(),
    };
    mockConnection = {
      createChannel: vi.fn().mockResolvedValue(mockChannel),
      on: vi.fn(),
      close: vi.fn(),
    };
    (amqp.connect as any).mockResolvedValue(mockConnection);

    mockFastify = {
      decorate: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should connect to RabbitMQ and decorate fastify", async () => {
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    expect(amqp.connect).toHaveBeenCalledWith(
      "amqp://user:password@rabbitmq:5672",
    );
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "rabbitMQ",
      expect.objectContaining({
        connection: mockConnection,
        channel: mockChannel,
        publishMessage: expect.any(Function),
        consumeMessages: expect.any(Function),
      }),
    );
  });

  test("should retry connection on failure with custom settings", async () => {
    (amqp.connect as any)
      .mockRejectedValueOnce(new Error("Connection failed"))
      .mockResolvedValueOnce(mockConnection);

    vi.spyOn(global, "setTimeout").mockImplementation((fn: any) => fn() as any);

    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    expect(amqp.connect).toHaveBeenCalledTimes(2);
    expect(mockFastify.decorate).toHaveBeenCalled();
  });

  test("should wait initial delay if provided", async () => {
    vi.spyOn(global, "setTimeout").mockImplementation((fn: any) => fn() as any);
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );
    expect(setTimeout).toHaveBeenCalled();
  });

  test("should skip initial delay if set to 0", async () => {
    vi.spyOn(global, "setTimeout").mockImplementation((fn: any) => fn() as any);
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      { initialDelay: 0 },
    );
    expect(setTimeout).not.toHaveBeenCalled();
  });

  test("should throw error if connection fails after retries", async () => {
    (amqp.connect as any).mockRejectedValue(new Error("Connection failed"));
    vi.spyOn(global, "setTimeout").mockImplementation((fn: any) => fn() as any);

    await expect(
      (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
        mockFastify as FastifyInstance,
        {},
      ),
    ).rejects.toThrow("Could not connect to RabbitMQ after multiple attempts");
  });

  test("should publish message", async () => {
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    const { publishMessage } = mockFastify.decorate.mock.calls[0][1];
    const result = await publishMessage("test-queue", "test-message");

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", {
      durable: true,
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "test-queue",
      Buffer.from("test-message"),
      { persistent: true },
    );
    expect(result).toBe(true);
  });

  test("should consume messages", async () => {
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    const { consumeMessages } = mockFastify.decorate.mock.calls[0][1];
    const callback = vi.fn();

    await consumeMessages("test-queue", callback);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", {
      durable: true,
    });
    expect(mockChannel.consume).toHaveBeenCalledWith(
      "test-queue",
      expect.any(Function),
    );

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const msg = { content: Buffer.from("test-message") };

    consumeCallback(msg);

    expect(callback).toHaveBeenCalledWith("test-message");
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  test("should handle connection error and close events", async () => {
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    const errorCallback = mockConnection.on.mock.calls.find(
      (call: any[]) => call[0] === "error",
    )?.[1];
    const closeCallback = mockConnection.on.mock.calls.find(
      (call: any[]) => call[0] === "close",
    )?.[1];

    expect(errorCallback).toBeDefined();
    expect(closeCallback).toBeDefined();

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const error = new Error("Test connection error");
    errorCallback(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("RabbitMQ error"),
      error,
    );

    closeCallback();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("RabbitMQ connection closed"),
    );
  });

  test("should handle null message in consumer", async () => {
    await (rabbitMQPlugin as FastifyPluginAsync<RabbitMQPluginOptions>)(
      mockFastify as FastifyInstance,
      {},
    );

    const { consumeMessages } = mockFastify.decorate.mock.calls[0][1];
    const callback = vi.fn();

    await consumeMessages("test-queue", callback);

    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    consumeCallback(null);

    expect(callback).not.toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
