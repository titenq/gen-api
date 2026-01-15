import { describe, test, expect } from "vitest";

import enUS from "@/locales/en-US";

describe("Locale en-US", () => {
  test("should export a valid object", () => {
    expect(enUS).toBeDefined();
    expect(typeof enUS).toBe("object");
  });

  test("should have 100% coverage by traversing all leaf values", () => {
    const traverse = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];

        if (value && typeof value === "object" && !Array.isArray(value)) {
          traverse(value);
        } else {
          expect(typeof value).toBe("string");
        }
      });
    };

    traverse(enUS);
  });
});
