import { describe, expect, test } from "vitest";

import getUserByIdSchema from "@/schemas/user/get-user-by-id.schema";

describe("getUserByIdSchema", () => {
  test("should have correct structure", () => {
    expect(getUserByIdSchema).toHaveProperty("summary");
    expect(getUserByIdSchema).toHaveProperty("tags");
    expect(getUserByIdSchema).toHaveProperty("params");
    expect(getUserByIdSchema).toHaveProperty("response");
  });

  test("should validate valid params", () => {
    const validParams = {
      id: "507f1f77bcf86cd799439011",
    };
    const result = getUserByIdSchema.params.safeParse(validParams);

    expect(result.success).toBe(true);
  });
});
