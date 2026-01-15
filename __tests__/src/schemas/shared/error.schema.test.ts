import { describe, expect, test } from "vitest";

import errorSchema from "@/schemas/shared/error.schema";

describe("errorSchema", () => {
  test("should validate error structure", () => {
    const validError = {
      statusCode: 400,
      error: true,
      message: "Invalid input",
    };
    const result = errorSchema.safeParse(validError);

    expect(result.success).toBe(true);
  });
});
