import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";

import registerService from "@/services/ws/register.service";
import verifyWSRoles from "@/helpers/verify-ws-roles";

vi.mock("@/helpers/verify-ws-roles", () => ({
  default: vi.fn(),
}));

describe("registerService", () => {
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

  test("should handle websocket connection with role verification", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => true,
    );

    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };
    const reqMock = {} as FastifyRequest;

    await registerService(fastify, socketMock as unknown as WebSocket, reqMock);

    expect(verifyWSRoles).toHaveBeenCalledWith(["ADMIN"]);
    expect(consumeWSMock).toHaveBeenCalledWith(
      "register",
      expect.any(Function),
    );

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).toHaveBeenCalledWith(JSON.stringify(testData));
    expect(socketMock.on).toHaveBeenCalledWith("message", expect.any(Function));

    const messageCallback = socketMock.on.mock.calls[0][1];
    const messageBuffer = Buffer.from("register-msg");

    await messageCallback(messageBuffer);

    expect(publishWSMock).toHaveBeenCalledWith("register", {
      event: "register",
      message: "register-msg",
    });
  });

  test("should not proceed if role verification fails", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => false,
    );

    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = {} as FastifyRequest;

    await registerService(fastify, socketMock as unknown as WebSocket, reqMock);

    expect(verifyWSRoles).toHaveBeenCalledWith(["ADMIN"]);
    expect(consumeWSMock).not.toHaveBeenCalled();
    expect(socketMock.on).not.toHaveBeenCalled();
  });

  test("should not send data if socket is not open", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => true,
    );

    const socketMock = {
      readyState: 3,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = {} as FastifyRequest;

    await registerService(fastify, socketMock as unknown as WebSocket, reqMock);

    expect(consumeWSMock).toHaveBeenCalled();

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).not.toHaveBeenCalled();
  });
});
