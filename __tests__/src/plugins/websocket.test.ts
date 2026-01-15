import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import * as amqp from "amqplib";

import websocketPlugin from "@/plugins/websocket";

vi.mock("amqplib");
vi.mock("@fastify/websocket", () => ({ default: vi.fn() }));
vi.mock("@/config/env", () => ({
  default: {
    RABBITMQ_USER: "user",
    RABBITMQ_PASSWORD: "password",
  },
}));

describe("websocketPlugin", () => {
  let mockFastify: any;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      assertExchange: vi.fn(),
      assertQueue: vi.fn().mockResolvedValue({ queue: "temp-queue" }),
      bindQueue: vi.fn(),
      consume: vi.fn(),
      publish: vi.fn(),
    };
    mockConnection = {
      createChannel: vi.fn().mockResolvedValue(mockChannel),
    };
    (amqp.connect as any).mockResolvedValue(mockConnection);

    mockFastify = {
      register: vi.fn(),
      decorate: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should register websocket and connect to RabbitMQ", async () => {
    await websocketPlugin(mockFastify as FastifyInstance);

    expect(mockFastify.register).toHaveBeenCalled();
    expect(amqp.connect).toHaveBeenCalledWith(
      "amqp://user:password@rabbitmq:5672",
    );
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "ws_exchange",
      "fanout",
      { durable: false },
    );
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "consumeWS",
      expect.any(Function),
    );
    expect(mockFastify.decorate).toHaveBeenCalledWith(
      "publishWS",
      expect.any(Function),
    );
  });

  test("should consume messages from websocket route", async () => {
    await websocketPlugin(mockFastify as FastifyInstance);

    const consumeWS = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "consumeWS",
    )[1];
    const callback = vi.fn();

    await consumeWS("test-route", callback);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("", {
      exclusive: true,
    });
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "ws_test-route_exchange",
      "fanout",
      { durable: false },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "temp-queue",
      "ws_test-route_exchange",
      "",
    );
    expect(mockChannel.consume).toHaveBeenCalledWith(
      "temp-queue",
      expect.any(Function),
      { noAck: true },
    );

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const msg = {
      content: Buffer.from(JSON.stringify({ event: "test", message: "hello" })),
    };

    consumeCallback(msg);

    expect(callback).toHaveBeenCalledWith({ event: "test", message: "hello" });
  });

  test("should publish messages to websocket route", async () => {
    await websocketPlugin(mockFastify as FastifyInstance);

    const publishWS = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "publishWS",
    )[1];
    const payload = { event: "test", message: "hello" };

    await publishWS("test-route", payload);

    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "ws_test-route_exchange",
      "fanout",
      { durable: false },
    );
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "ws_test-route_exchange",
      "",
      Buffer.from(JSON.stringify(payload)),
    );
  });

  test("should handle null message in consumer", async () => {
    await websocketPlugin(mockFastify as FastifyInstance);

    const consumeWS = mockFastify.decorate.mock.calls.find(
      (call: any) => call[0] === "consumeWS",
    )[1];
    const callback = vi.fn();

    await consumeWS("test-route", callback);

    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    consumeCallback(null);

    expect(callback).not.toHaveBeenCalled();
  });
});
