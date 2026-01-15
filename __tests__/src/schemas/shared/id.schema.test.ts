import { describe, expect, test } from "vitest";

import idSchema from "@/schemas/shared/id.schema";

describe("idSchema", () => {
  test("should accept valid id", () => {
    const result = idSchema.safeParse("507f1f77bcf86cd799439011");

    expect(result.success).toBe(true);
  });
});
