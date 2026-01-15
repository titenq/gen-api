import { describe, expect, test } from "vitest";

import forgotPasswordSchema from "@/schemas/auth/forgot-password.schema";

describe("forgotPasswordSchema", () => {
  test("should have correct structure", () => {
    expect(forgotPasswordSchema).toHaveProperty("body");
  });

  test("should validate valid body", () => {
    const validBody = {
      email: "test@example.com",
    };
    const result = forgotPasswordSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
