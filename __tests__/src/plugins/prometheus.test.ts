import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import client from "prom-client";

import prometheusPlugin from "@/plugins/prometheus";

vi.mock("prom-client", () => {
  const Registry = vi.fn();

  Registry.prototype.registerMetric = vi.fn();
  Registry.prototype.metrics = vi.fn().mockResolvedValue("metrics");
  Registry.prototype.contentType = "text/plain";

  const Gauge = vi.fn();

  Gauge.prototype.inc = vi.fn();
  Gauge.prototype.dec = vi.fn();

  const Counter = vi.fn();
  Counter.prototype.inc = vi.fn();

  const Histogram = vi.fn();
  Histogram.prototype.observe = vi.fn();

  return {
    default: {
      Registry,
      collectDefaultMetrics: vi.fn(),
      Gauge,
      Counter,
      Histogram,
    },
  };
});

vi.mock("@/config/env", () => ({
  default: {},
}));

describe("prometheusPlugin", () => {
  let mockApp: any;
  let hooks: Record<string, Function>;

  beforeEach(() => {
    hooks = {};
    mockApp = {
      addHook: vi.fn((name, handler) => {
        hooks[name] = handler;
      }),
      get: vi.fn(),
    };
    vi.clearAllMocks();
  });

  test("should register default metrics and hooks", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    expect(client.collectDefaultMetrics).toHaveBeenCalled();
    expect(mockApp.addHook as any).toHaveBeenCalledWith(
      "onRequest",
      expect.any(Function),
    );
    expect(mockApp.addHook as any).toHaveBeenCalledWith(
      "onResponse",
      expect.any(Function),
    );
    expect(mockApp.get as any).toHaveBeenCalledWith(
      "/api/v1/metrics",
      expect.any(Function),
    );
  });

  test("should increment inflight requests on request", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    const done = vi.fn();
    const inflightHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onRequest" && call[1].length === 3,
    )[1];

    inflightHook({}, {}, done);
    expect(client.Gauge.prototype.inc).toHaveBeenCalled();
    expect(done).toHaveBeenCalled();
  });

  test("should decrement inflight requests on response", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    const done = vi.fn();
    const inflightHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onResponse" && call[1].length === 3,
    )[1];

    inflightHook({}, {}, done);
    expect(client.Gauge.prototype.dec).toHaveBeenCalled();
    expect(done).toHaveBeenCalled();
  });

  test("should record metrics on response", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    const startEpochHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onRequest" && call[1].length === 1,
    )[1];

    const req: any = {
      method: "GET",
      url: "/test",
      routeOptions: { url: "/test" },
    };

    await startEpochHook(req);

    expect(req.startEpoch).toBeDefined();

    const metricsHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onResponse" && call[1].length === 2,
    )[1];

    const reply: any = { statusCode: 200 };

    await metricsHook(req, reply);

    expect(client.Counter.prototype.inc).toHaveBeenCalledWith({
      method: "GET",
      route: "/test",
      status_code: 200,
    });

    expect(client.Histogram.prototype.observe).toHaveBeenCalledWith(
      {
        method: "GET",
        route: "/test",
        status_code: 200,
      },
      expect.any(Number),
    );
  });

  test("should expose metrics endpoint", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    const handler = mockApp.get.mock.calls[0][1];
    const reply = { header: vi.fn() };
    const result = await handler({}, reply);

    expect(reply.header).toHaveBeenCalledWith("Content-Type", "text/plain");
    expect(result).toBe("metrics");
  });

  test("should fallback to req.url if routeOptions is missing", async () => {
    await prometheusPlugin(mockApp as FastifyInstance, {});

    const startEpochHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onRequest" && call[1].length === 1,
    )[1];

    const req: any = { method: "GET", url: "/fallback" };

    await startEpochHook(req);

    const metricsHook = mockApp.addHook.mock.calls.find(
      (call: any) => call[0] === "onResponse" && call[1].length === 2,
    )[1];

    const reply: any = { statusCode: 404 };

    await metricsHook(req, reply);

    expect(client.Counter.prototype.inc).toHaveBeenCalledWith({
      method: "GET",
      route: "/fallback",
      status_code: 404,
    });

    expect(client.Histogram.prototype.observe).toHaveBeenCalledWith(
      {
        method: "GET",
        route: "/fallback",
        status_code: 404,
      },
      expect.any(Number),
    );
  });
});
