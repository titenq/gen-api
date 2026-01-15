import { describe, expect, test } from "vitest";

import messageSchema from "@/schemas/shared/message.schema";

describe("messageSchema", () => {
  test("should validate message structure", () => {
    const validMessage = "Operation successful";
    const result = messageSchema.safeParse(validMessage);

    expect(result.success).toBe(true);
  });
});
