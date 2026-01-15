import { describe, test, expect } from "vitest";

import * as authSchemas from "@/schemas/auth";
import * as sharedSchemas from "@/schemas/shared";
import * as userSchemas from "@/schemas/user";

describe("Schemas Barrel Files", () => {
  test("should export auth schemas", () => {
    expect(authSchemas).toBeDefined();
    expect(Object.keys(authSchemas).length).toBeGreaterThan(0);
  });

  test("should export shared schemas", () => {
    expect(sharedSchemas).toBeDefined();
    expect(Object.keys(sharedSchemas).length).toBeGreaterThan(0);
  });

  test("should export user schemas", () => {
    expect(userSchemas).toBeDefined();
    expect(Object.keys(userSchemas).length).toBeGreaterThan(0);
  });
});
