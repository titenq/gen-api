import { describe, expect, test } from "vitest";

import createdAtSchema from "@/schemas/shared/created-at.schema";

describe("createdAtSchema", () => {
  test("should accept valid date", () => {
    const result = createdAtSchema.safeParse(new Date());

    expect(result.success).toBe(true);
  });

  test("should accept valid date string", () => {
    const result = createdAtSchema.safeParse(new Date().toISOString());

    expect(result.success).toBe(true);
  });
});
