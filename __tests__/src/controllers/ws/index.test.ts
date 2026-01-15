import { describe, expect, test } from "vitest";

import wsController from "@/controllers/ws";
import testController from "@/controllers/ws/test.controller";
import registerController from "@/controllers/ws/register.controller";

describe("wsController Index", () => {
  test("should export controllers", () => {
    expect(wsController.test).toBe(testController);
    expect(wsController.register).toBe(registerController);
  });
});
