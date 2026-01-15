import { describe, expect, test } from "vitest";

import { healthSchema } from "@/schemas/health/health.schema";

describe("Health Schema", () => {
  test("should have correct structure", () => {
    expect(healthSchema).toHaveProperty("summary");
    expect(healthSchema).toHaveProperty("tags");
    expect(healthSchema).toHaveProperty("response");
  });

  test("should have correct response codes", () => {
    expect(healthSchema.response).toHaveProperty("200");
    expect(healthSchema.response).toHaveProperty("500");
  });
});
