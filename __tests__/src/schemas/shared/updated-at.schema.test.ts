import { describe, expect, test } from "vitest";

import updatedAtSchema from "@/schemas/shared/updated-at.schema";

describe("updatedAtSchema", () => {
  test("should accept valid date", () => {
    const result = updatedAtSchema.safeParse(new Date());

    expect(result.success).toBe(true);
  });

  test("should accept valid date string", () => {
    const result = updatedAtSchema.safeParse(new Date().toISOString());

    expect(result.success).toBe(true);
  });
});
