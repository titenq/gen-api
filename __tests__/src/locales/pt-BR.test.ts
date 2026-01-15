import { describe, test, expect } from "vitest";

import ptBR from "@/locales/pt-BR";

describe("Locale pt-BR", () => {
  test("should export a valid object", () => {
    expect(ptBR).toBeDefined();
    expect(typeof ptBR).toBe("object");
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

    traverse(ptBR);
  });
});
