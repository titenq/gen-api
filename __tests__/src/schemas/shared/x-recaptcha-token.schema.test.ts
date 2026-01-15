import { describe, expect, test, vi } from "vitest";

const loadSchemaWithEnv = async (envValue: string) => {
  vi.resetModules();
  vi.doMock("@/config/env", () => ({ default: { NODE_ENV: envValue } }));

  const module = await import("@/schemas/shared/x-recaptcha-token.schema");

  return module.default;
};

describe("xRecaptchaTokenSchema", () => {
  test("should accept any token in development mode", async () => {
    const schema = await loadSchemaWithEnv("development");
    const result = schema.safeParse("short");

    expect(result.success).toBe(true);
  });

  test("should accept valid token in production", async () => {
    const schema = await loadSchemaWithEnv("production");
    const result = schema.safeParse("a".repeat(40));

    expect(result.success).toBe(true);
  });

  test("should reject invalid token in production", async () => {
    const schema = await loadSchemaWithEnv("production");
    const result = schema.safeParse("short");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "validation.xRecaptchaToken.invalidFormat",
    );
  });
});
