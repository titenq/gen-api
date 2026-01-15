import { describe, test, expect, vi } from "vitest";
import admZip from "adm-zip";

import buildApp from "@/app";
import { API_PREFIX } from "@/constants/constants";
import getAppName from "@/helpers/get-app-name";

vi.mock("@/helpers/log-rotate", () => ({
  default: () => ({
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    emit: vi.fn(),
  }),
}));

vi.mock("@/plugins/prometheus", () => ({
  default: async (fastify: any) => fastify,
}));

vi.mock("@/plugins/rabbitmq", () => ({
  default: async (fastify: any) => {
    fastify.decorate("rabbitMQ", {
      connection: {},
      channel: {},
      publishMessage: vi.fn(),
      consumeMessages: vi.fn(),
    });
  },
}));

vi.mock("@/plugins/redis", () => ({
  default: async (fastify: any) => {
    fastify.decorate("redis", {});
    fastify.decorate("cache", async (_key: any, _ttl: any, fetcher: any) => {
      return await fetcher();
    });
  },
}));

vi.mock("@/plugins/websocket", () => ({
  default: async () => {},
}));

describe("Proto Zip Route", () => {
  test(
    "should return a zip file containing specific proto files",
    { timeout: 10000 },
    async () => {
      const app = await buildApp();

      const response = await app.inject({
        method: "GET",
        url: `${API_PREFIX}/proto`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("application/zip");
      expect(response.headers["content-disposition"]).toBe(
        `attachment; filename="${getAppName()}_proto.zip"`,
      );

      const zipBuffer = response.rawPayload;
      const zip = new admZip(zipBuffer);
      const zipEntries = zip.getEntries();
      const fileNames = zipEntries.map((entry) => entry.entryName);

      expect(fileNames).toContain("user.proto");
    },
  );
});
