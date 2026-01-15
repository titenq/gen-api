import fs from "node:fs";
import path from "node:path";

import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs");
vi.mock("node:path");
vi.mock("@/config/env", () => ({
  default: {
    API_PREFIX: "/api/v1",
  },
}));
vi.mock("@/helpers/translate", () => ({
  default: (key: string) => `translated_${key}`,
}));
vi.mock("@/helpers/get-app-version", () => ({
  default: () => "1.0.0",
}));

describe("swagger-options", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("mock-content"));
  });

  test("should export fastifySwaggerOptions with correct values", async () => {
    const { fastifySwaggerOptions } =
      await import("../../../src/helpers/swagger-options");

    expect(fastifySwaggerOptions).toEqual(
      expect.objectContaining({
        openapi: {
          info: {
            title: "translated_schema.info.title",
            description: "translated_schema.info.description",
            version: "1.0.0",
          },
          components: {
            securitySchemes: {
              refreshTokenCookie: {
                type: "apiKey",
                in: "cookie",
                name: "refreshToken",
                description: "translated_schema.security.description",
              },
            },
          },
        },
      }),
    );
  });

  test("should export fastifySwaggerUiOptions with correct values", async () => {
    const { fastifySwaggerUiOptions } =
      await import("@/helpers/swagger-options");

    expect(fastifySwaggerUiOptions).toEqual(
      expect.objectContaining({
        routePrefix: "/api/v1/docs",
        logo: {
          type: "image/png",
          content: Buffer.from("mock-content"),
        },
        theme: expect.objectContaining({
          favicon: expect.arrayContaining([
            expect.objectContaining({
              content: Buffer.from("mock-content"),
            }),
          ]),
        }),
      }),
    );
  });
});
