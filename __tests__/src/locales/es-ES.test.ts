import { describe, test, expect } from "vitest";

import esES from "@/locales/es-ES";

describe("Locale es-ES", () => {
  test("should export a valid object", () => {
    expect(esES).toBeDefined();
    expect(typeof esES).toBe("object");
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

    traverse(esES);
  });
});
