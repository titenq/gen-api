import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import indexRoute from "@/routes/index.route";

vi.mock("node:fs", () => ({
  readdirSync: vi
    .fn()
    .mockReturnValue(["test.route.ts", "index.route.ts", "other.js"]),
}));

vi.mock("node:path", async () => {
  const actual = await vi.importActual("node:path");

  return {
    ...actual,
    resolve: vi.fn().mockImplementation((...args) => args.join("/")),
  };
});

const mockRouteModule = { default: vi.fn() };

vi.mock("/process/cwd/src/routes/test.route.ts", () => mockRouteModule);
vi.mock("/process/cwd/src/routes/other.js", () => mockRouteModule);

describe("indexRoute", () => {
  let fastify: FastifyInstance;
  let registerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    registerMock = vi.fn();

    fastify = {
      register: registerMock,
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
    vi.spyOn(process, "cwd").mockReturnValue("/process/cwd");
  });

  test("should register routes from files in the directory", async () => {
    await indexRoute(fastify);

    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(registerMock).toHaveBeenCalledWith(expect.anything(), {
      prefix: "/api/v1",
    });
  });
});
