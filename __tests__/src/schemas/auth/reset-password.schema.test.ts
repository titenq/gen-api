import { describe, expect, test } from "vitest";

import resetPasswordSchema from "@/schemas/auth/reset-password.schema";

describe("resetPasswordSchema", () => {
  test("should have correct structure", () => {
    expect(resetPasswordSchema).toHaveProperty("body");
  });

  test("should validate valid body", () => {
    const validBody = {
      token: "some-token",
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    };
    const result = resetPasswordSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
