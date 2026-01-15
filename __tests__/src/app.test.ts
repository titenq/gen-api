import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/plugins/redis", () => ({ default: async (f: any) => f }));
vi.mock("@/plugins/rabbitmq", () => ({ default: async (f: any) => f }));
vi.mock("@/plugins/prometheus", () => ({ default: async (f: any) => f }));
vi.mock("@/plugins/websocket", () => ({ default: async (f: any) => f }));
vi.mock("@/plugins/protobuf", () => ({ default: async (f: any) => f }));
vi.mock("@/config/rate-limit", () => ({ default: async (f: any) => f }));
vi.mock("@/routes/index.route", () => ({ default: async (f: any) => f }));
vi.mock("@/helpers/log-rotate", () => ({
  default: () => ({
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    emit: vi.fn(),
  }),
}));

describe("src/app.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should build app with default development config", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "development",
        COOKIE_SECRET: "secret",
        JWT_SECRET: "secret",
        ACCEPT_LANGUAGE: undefined,
      },
    }));

    const buildApp = (await import("@/app")).default;
    const app = await buildApp();

    expect(app).toBeDefined();

    await expect(app.ready()).resolves.not.toThrow();
    await app.close();
  });

  test("should build app with production config", async () => {
    vi.doMock("@/config/env", () => ({
      default: {
        NODE_ENV: "production",
        COOKIE_SECRET: "secret",
        JWT_SECRET: "secret",
        ACCEPT_LANGUAGE: "pt-BR",
      },
    }));

    const buildApp = (await import("@/app")).default;
    const app = await buildApp();

    expect(app).toBeDefined();

    await expect(app.ready()).resolves.not.toThrow();
    await app.close();
  });
});
