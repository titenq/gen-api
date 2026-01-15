import { describe, expect, test } from "vitest";

import _idSchema from "@/schemas/shared/_id.schema";

describe("_idSchema", () => {
  test("should accept valid mongo id", () => {
    const result = _idSchema.safeParse("507f1f77bcf86cd799439011");

    expect(result.success).toBe(true);
  });

  test("should reject invalid mongo id", () => {
    const result = _idSchema.safeParse("invalid-id");

    expect(result.success).toBe(false);
  });
});
