import { describe, expect, test } from "vitest";

import loginSchema from "@/schemas/auth/login.schema";

describe("loginSchema", () => {
  test("should have correct structure", () => {
    expect(loginSchema).toHaveProperty("summary");
    expect(loginSchema).toHaveProperty("tags");
    expect(loginSchema).toHaveProperty("headers");
    expect(loginSchema).toHaveProperty("body");
    expect(loginSchema).toHaveProperty("response");
  });

  test("should validate valid body", () => {
    const validBody = {
      email: "test@example.com",
      password: "Password123!",
    };
    const result = loginSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
