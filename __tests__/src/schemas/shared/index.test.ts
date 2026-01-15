import { describe, expect, test } from "vitest";

import * as sharedSchemas from "@/schemas/shared";

describe("Shared Schemas Index", () => {
  test("should export all schemas", () => {
    expect(sharedSchemas).toHaveProperty("_idSchema");
    expect(sharedSchemas).toHaveProperty("createdAtSchema");
    expect(sharedSchemas).toHaveProperty("emailSchema");
    expect(sharedSchemas).toHaveProperty("errorSchema");
    expect(sharedSchemas).toHaveProperty("idSchema");
    expect(sharedSchemas).toHaveProperty("messageSchema");
    expect(sharedSchemas).toHaveProperty("nameSchema");
    expect(sharedSchemas).toHaveProperty("passwordSchema");
    expect(sharedSchemas).toHaveProperty("rolesSchema");
    expect(sharedSchemas).toHaveProperty("updatedAtSchema");
    expect(sharedSchemas).toHaveProperty("userIdSchema");
    expect(sharedSchemas).toHaveProperty("xRecaptchaTokenSchema");
  });
});
