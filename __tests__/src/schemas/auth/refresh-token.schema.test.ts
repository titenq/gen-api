import { describe, expect, test } from "vitest";

import refreshTokenSchema from "@/schemas/auth/refresh-token.schema";

describe("refreshTokenSchema", () => {
  test("should have correct structure", () => {
    expect(refreshTokenSchema).toHaveProperty("summary");
  });
});
