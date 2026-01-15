import { describe, expect, test } from "vitest";

import * as authSchemas from "@/schemas/auth";

describe("Auth Schemas Index", () => {
  test("should export all schemas", () => {
    expect(authSchemas).toHaveProperty("forgotPasswordSchema");
    expect(authSchemas).toHaveProperty("loginSchema");
    expect(authSchemas).toHaveProperty("logoutSchema");
    expect(authSchemas).toHaveProperty("refreshTokenSchema");
    expect(authSchemas).toHaveProperty("registerSchema");
    expect(authSchemas).toHaveProperty("resendLinkSchema");
    expect(authSchemas).toHaveProperty("resetPasswordSchema");
    expect(authSchemas).toHaveProperty("verifyEmailSchema");
  });
});
