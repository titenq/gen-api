import { describe, expect, test } from "vitest";

import verifyEmailSchema from "@/schemas/auth/verify-email.schema";

describe("verifyEmailSchema", () => {
  test("should have correct structure", () => {
    expect(verifyEmailSchema).toHaveProperty("body");
  });

  test("should validate valid body", () => {
    const validBody = {
      token: "some-token",
    };
    const result = verifyEmailSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
