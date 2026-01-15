import { describe, expect, test } from "vitest";

import * as userSchemas from "@/schemas/user";

describe("User Schemas Index", () => {
  test("should export all schemas", () => {
    expect(userSchemas).toHaveProperty("getUserByIdSchema");
    expect(userSchemas).toHaveProperty("getUsersSchema");
  });
});
