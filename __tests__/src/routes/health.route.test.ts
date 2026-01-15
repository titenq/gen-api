import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import healthRoute from "@/routes/health.route";
import healthController from "@/controllers/health/health.controller";
import { healthSchema } from "@/schemas/health/health.schema";

describe("healthRoute", () => {
  let fastify: FastifyInstance;
  let getMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMock = vi.fn();

    fastify = {
      withTypeProvider: () => ({ get: getMock }),
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should register GET /health with correct schema and config", async () => {
    await healthRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/health")!;
    const [path, options, handler] = call;

    expect(path).toBe("/health");
    expect(handler).toBe(healthController);
    expect(options.schema).toBe(healthSchema);
    expect(options.config).toEqual({
      rateLimit: false,
    });
    expect(options.compress).toBe(false);
  });
});
