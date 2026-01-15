import { describe, expect, test } from "vitest";

import userIdSchema from "@/schemas/shared/user-id.schema";

describe("userIdSchema", () => {
  test("should accept valid mongo id", () => {
    const result = userIdSchema.safeParse("507f1f77bcf86cd799439011");

    expect(result.success).toBe(true);
  });
});
