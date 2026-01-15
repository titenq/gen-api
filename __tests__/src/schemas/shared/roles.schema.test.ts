import { describe, expect, test } from "vitest";

import rolesSchema from "@/schemas/shared/roles.schema";

describe("rolesSchema", () => {
  test("should accept array of strings", () => {
    const result = rolesSchema.safeParse(["ADMIN", "USER"]);

    expect(result.success).toBe(true);
  });
});
