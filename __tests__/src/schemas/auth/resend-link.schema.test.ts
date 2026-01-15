import { describe, expect, test } from "vitest";

import resendLinkSchema from "@/schemas/auth/resend-link.schema";

describe("resendLinkSchema", () => {
  test("should have correct structure", () => {
    expect(resendLinkSchema).toHaveProperty("body");
  });

  test("should validate valid body", () => {
    const validBody = {
      email: "test@example.com",
    };
    const result = resendLinkSchema.body.safeParse(validBody);

    expect(result.success).toBe(true);
  });
});
