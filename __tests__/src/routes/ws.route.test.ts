import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import wsRoute from "@/routes/ws.route";
import verifyWSRoles from "@/helpers/verify-ws-roles";

vi.mock("@/helpers/verify-ws-roles", () => ({
  default: vi.fn(),
}));

describe("wsRoute", () => {
  let fastify: FastifyInstance;
  let getMock: ReturnType<typeof vi.fn>;
  let consumeWSMock: ReturnType<typeof vi.fn>;
  let publishWSMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMock = vi.fn();
    consumeWSMock = vi.fn();
    publishWSMock = vi.fn();

    fastify = {
      get: getMock,
      consumeWS: consumeWSMock,
      publishWS: publishWSMock,
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should register GET /ws/test and handle websocket events", async () => {
    await wsRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/ws/test")!;

    expect(call).toBeDefined();

    const [path, options, handler] = call;

    expect(path).toBe("/ws/test");
    expect(options).toMatchObject({ websocket: true });

    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = { server: fastify };

    await handler(socketMock, reqMock);

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

  test("should not send data in /ws/test if socket is not open", async () => {
    await wsRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/ws/test")!;
    const [, , handler] = call;

    const socketMock = {
      readyState: 2,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = { server: fastify };

    await handler(socketMock, reqMock);

    expect(consumeWSMock).toHaveBeenCalledWith("test", expect.any(Function));

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).not.toHaveBeenCalled();
  });

  test("should register GET /ws/register and handle websocket events with role verification", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => true,
    );

    await wsRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/ws/register")!;

    expect(call).toBeDefined();

    const [path, options, handler] = call;

    expect(path).toBe("/ws/register");
    expect(options).toMatchObject({ websocket: true });

    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = { server: fastify };

    await handler(socketMock, reqMock);

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

  test("should not send data in /ws/register if socket is not open", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => true,
    );

    await wsRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/ws/register")!;
    const [, , handler] = call;

    const socketMock = {
      readyState: 3,
      send: vi.fn(),
      on: vi.fn(),
    };

    const reqMock = { server: fastify };

    await handler(socketMock, reqMock);

    expect(consumeWSMock).toHaveBeenCalledWith(
      "register",
      expect.any(Function),
    );

    const consumeCallback = consumeWSMock.mock.calls[0][1];
    const testData = { some: "data" };

    consumeCallback(testData);

    expect(socketMock.send).not.toHaveBeenCalled();
  });

  test("should not proceed in /ws/register if role verification fails", async () => {
    (verifyWSRoles as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      () => false,
    );

    await wsRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/ws/register")!;
    const [, , handler] = call;
    const socketMock = {
      readyState: 1,
      send: vi.fn(),
      on: vi.fn(),
    };
    const reqMock = { server: fastify };

    await handler(socketMock, reqMock);

    expect(verifyWSRoles).toHaveBeenCalledWith(["ADMIN"]);
    expect(consumeWSMock).not.toHaveBeenCalled();
    expect(socketMock.on).not.toHaveBeenCalled();
  });
});
