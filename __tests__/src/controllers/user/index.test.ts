import { describe, test, expect } from "vitest";

import * as userControllers from "@/controllers/user";

describe("User Controllers Exports", () => {
  test("should export getUserById", () => {
    expect(userControllers.getUserById).toBeDefined();
    expect(typeof userControllers.getUserById).toBe("function");
  });

  test("should export getUsers", () => {
    expect(userControllers.getUsers).toBeDefined();
    expect(typeof userControllers.getUsers).toBe("function");
  });
});
