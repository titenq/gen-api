import { describe, test, expect } from "vitest";

import normalizeString from "@/helpers/normalize-string";

describe("normalizeString", () => {
  test("should normalize a string by removing accents", () => {
    expect(normalizeString("Olá Mundo")).toBe("ola mundo");
    expect(normalizeString("ÁÉÍÓÚáéíóú")).toBe("aeiouaeiou");
  });

  test("should convert to lowercase", () => {
    expect(normalizeString("HELLO WORLD")).toBe("hello world");
  });

  test("should trim whitespace", () => {
    expect(normalizeString("  hello world  ")).toBe("hello world");
  });

  test("should replace multiple spaces with a single space", () => {
    expect(normalizeString("hello   world")).toBe("hello world");
  });

  test("should handle combined cases", () => {
    expect(normalizeString("  Olá   MUNDO  ")).toBe("ola mundo");
  });

  test("should handle empty strings", () => {
    expect(normalizeString("")).toBe("");
  });
});
