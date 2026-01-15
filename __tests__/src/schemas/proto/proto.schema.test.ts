import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { protoSchema } from "@/schemas/proto/proto.schema";

vi.mock("@/helpers/translate", () => ({
  default: (key: string) => key,
}));

vi.mock("@/schemas/shared", () => ({
  errorSchema: z.object({}),
}));

describe("Proto Schema", () => {
  test("should have correct summary", () => {
    expect(protoSchema.summary).toBe("schema.summary.downloadProto");
  });

  test("should have correct tags", () => {
    expect(protoSchema.tags).toEqual(["schema.tags.proto"]);
  });

  test("should have correct produces", () => {
    expect(protoSchema.produces).toEqual([
      "application/zip",
      "application/json",
    ]);
  });

  test("should have correct response for 200", () => {
    expect(protoSchema.response[200]).toBeInstanceOf(z.ZodType);
    expect(protoSchema.response[200].description).toBe("Proto files");
  });

  test("should have correct response for 429", () => {
    expect(protoSchema.response[429].description).toBe("Too many requests");
  });

  test("should have correct response for 500", () => {
    expect(protoSchema.response[500].description).toBe("Internal server error");
  });
});
