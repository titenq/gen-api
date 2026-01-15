import { describe, test, expect } from "vitest";

import createErrorMessage from "@/helpers/create-error-message";

describe("src/helpers/create-error-message.ts", () => {
  test("should return error object with default status code 400", () => {
    const message = "error.test";
    const result = createErrorMessage(message);

    expect(result).toEqual({
      error: true,
      message,
      statusCode: 400,
    });
  });

  test("should return error object with provided status code", () => {
    const message = "error.test";
    const statusCode = 404;
    const result = createErrorMessage(message, statusCode);

    expect(result).toEqual({
      error: true,
      message,
      statusCode,
    });
  });
});
