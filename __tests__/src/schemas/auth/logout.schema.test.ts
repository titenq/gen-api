import { describe, expect, test } from "vitest";

import logoutSchema from "@/schemas/auth/logout.schema";

describe("logoutSchema", () => {
  test("should have correct structure", () => {
    expect(logoutSchema).toHaveProperty("summary");
  });
});
