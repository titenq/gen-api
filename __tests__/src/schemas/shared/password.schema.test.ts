import { describe, expect, test } from "vitest";

import passwordSchema from "@/schemas/shared/password.schema";

describe("passwordSchema", () => {
  test("should accept valid password", () => {
    const result = passwordSchema.safeParse("Password123!");

    expect(result.success).toBe(true);
  });

  test("should reject short password", () => {
    const result = passwordSchema.safeParse("123");

    expect(result.success).toBe(false);
  });
});
