import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";

import testController from "@/controllers/ws/test.controller";

describe("wsController Test", () => {
  let fastify: FastifyInstance;
  let consumeWSMock: ReturnType<typeof vi.fn>;
  let publishWSMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    consumeWSMock = vi.fn();
    publishWSMock = vi.fn();

    fastify = {
      consumeWS: consumeWSMock,
      publishWS: publishWSMock,
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should handle websocket connection, consumption and publishing", async () => {
    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };

    await testController(
      socketMock as unknown as WebSocket,
      { server: fastify } as FastifyRequest,
    );

    expect(socketMock.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "connection", message: "Connected" }),
    );

    expect(consumeWSMock).toHaveBeenCalledWith("test", expect.any(Function));

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).toHaveBeenCalledWith(JSON.stringify(testData));
    expect(socketMock.on).toHaveBeenCalledWith("message", expect.any(Function));

    const messageCallback = socketMock.on.mock.calls[0][1];
    const messageBuffer = Buffer.from("hello");

    await messageCallback(messageBuffer);

    expect(publishWSMock).toHaveBeenCalledWith("test", {
      event: "test",
      message: "hello",
    });
  });

  test("should not send data if socket is not open", async () => {
    const socketMock = {
      readyState: 2,
      send: vi.fn(),
      on: vi.fn(),
    };

    await testController(
      socketMock as unknown as WebSocket,
      { server: fastify } as FastifyRequest,
    );

    expect(consumeWSMock).toHaveBeenCalledWith("test", expect.any(Function));

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).not.toHaveBeenCalled();
  });
});
