import { describe, test, expect, vi, beforeEach } from "vitest";

import translate from "@/helpers/translate";

vi.mock("@/locales/en-US", () => ({
  default: {
    hello: "Hello",
    nested: {
      key: "Nested Value",
    },
  },
}));

vi.mock("@/locales/pt-BR", () => ({
  default: {
    hello: "Olá",
  },
}));

vi.mock("@/locales/es-ES", () => ({
  default: {
    hello: "Hola",
  },
}));

describe("translate", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("should translate a key to the default locale (en-US)", () => {
    expect(translate("hello")).toBe("Hello");
  });

  test("should handle nested keys", () => {
    expect(translate("nested.key")).toBe("Nested Value");
  });

  test("should return the key if translation is missing", () => {
    expect(translate("missing.key")).toBe("missing.key");
  });
});
