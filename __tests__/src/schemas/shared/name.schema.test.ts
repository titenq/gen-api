import { describe, expect, test } from "vitest";

import nameSchema from "@/schemas/shared/name.schema";

describe("nameSchema", () => {
  test("should accept valid name", () => {
    const result = nameSchema.safeParse("John Doe");

    expect(result.success).toBe(true);
  });

  test("should reject empty name", () => {
    const result = nameSchema.safeParse("");

    expect(result.success).toBe(false);
  });
});
