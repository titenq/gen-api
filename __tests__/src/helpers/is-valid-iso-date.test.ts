import { describe, test, expect } from "vitest";

import isValidISODate from "@/helpers/is-valid-iso-date";

describe("isValidISODate", () => {
  test("should return true for a valid ISO date string", () => {
    expect(isValidISODate("2023-10-27T10:00:00.000Z")).toBe(true);
    expect(isValidISODate("2023-10-27")).toBe(true);
  });

  test("should return false for an invalid ISO date string", () => {
    expect(isValidISODate("invalid-date")).toBe(false);
    expect(isValidISODate("2023-13-45")).toBe(false);
    expect(isValidISODate("2023-10-27T25:00:00.000Z")).toBe(false);
  });

  test("should return false for non-string inputs", () => {
    expect(isValidISODate(null as any)).toBe(false);
    expect(isValidISODate(undefined as any)).toBe(false);
    expect(isValidISODate(123 as any)).toBe(false);
    expect(isValidISODate({} as any)).toBe(false);
  });

  test("should return false if the string length does not match the ISO string length", () => {
    expect(isValidISODate("2023/10/27")).toBe(false);
  });
});
