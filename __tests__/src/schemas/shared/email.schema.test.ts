import { describe, expect, test } from "vitest";

import emailSchema from "@/schemas/shared/email.schema";

describe("emailSchema", () => {
  test("should accept valid email", () => {
    const result = emailSchema.safeParse("test@example.com");

    expect(result.success).toBe(true);
  });

  test("should reject invalid email", () => {
    const result = emailSchema.safeParse("invalid-email");

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe("validation.email.invalid");
    }
  });
});
