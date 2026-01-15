import { describe, expect, test } from "vitest";

import registerSchema from "@/schemas/auth/register.schema";

describe("registerSchema", () => {
  test("should have correct structure", () => {
    expect(registerSchema).toHaveProperty("summary");
    expect(registerSchema).toHaveProperty("body");
  });

  test("should validate valid body", () => {
    const validBody = {
      name: "John Doe",
      email: "test@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    };
    const result = registerSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
