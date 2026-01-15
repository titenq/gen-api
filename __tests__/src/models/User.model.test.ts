import { describe, expect, vi, beforeEach, beforeAll, test } from "vitest";
import mongoose from "mongoose";
import argon2 from "argon2";

import normalizeString from "@/helpers/normalize-string";
import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";

vi.mock("@/db", async () => {
  const actual = await vi.importActual<typeof import("mongoose")>("mongoose");

  return {
    default: actual,
  };
});

vi.mock("argon2");
vi.mock("@/helpers/normalize-string");

const preSpy = vi.spyOn(mongoose.Schema.prototype, "pre");

describe("User Model", () => {
  let saveHook: (this: any) => Promise<void>;
  let UserModel: mongoose.Model<UserInterface.IUserModel>;

  beforeAll(async () => {
    const module = await import("@/models/User.model");
    UserModel = module.default;

    const saveCall = preSpy.mock.calls.find((call) => {
      if ((call[0] as string) !== "save") {
        return false;
      }

      const fn = call[1] as Function;

      return fn.toString().includes("normalizedName");
    });

    if (saveCall) {
      saveHook = saveCall[1] as any;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should have registered a pre-save hook", () => {
    expect(saveHook).toBeDefined();
    expect(saveHook).toBeTypeOf("function");
  });

  describe("Schema Validation", () => {
    test("should validate a valid user", async () => {
      const validUser = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const user = new UserModel(validUser);

      await expect(user.validate()).resolves.not.toThrow();

      expect(user.roles).toContain(Roles.USER);
      expect(user.isEmailVerified).toBe(false);
    });

    test("should require name", async () => {
      const user = new UserModel({
        email: "john@example.com",
        password: "password123",
      });

      await expect(user.validate()).rejects.toThrow(/Path `name` is required/);
    });

    test("should require email", async () => {
      const user = new UserModel({
        name: "John Doe",
        password: "password123",
      });

      await expect(user.validate()).rejects.toThrow(/Path `email` is required/);
    });

    test("should require password", async () => {
      const user = new UserModel({
        name: "John Doe",
        email: "john@example.com",
      });

      await expect(user.validate()).rejects.toThrow(
        /Path `password` is required/,
      );
    });

    test("should lowercase email", () => {
      const user = new UserModel({
        name: "John Doe",
        email: "JOHN@EXAMPLE.COM",
        password: "password123",
      });

      expect(user.email).toBe("john@example.com");
    });

    test("should validate roles enum", async () => {
      const user = new UserModel({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        roles: ["INVALID_ROLE"],
      });

      await expect(user.validate()).rejects.toThrow(
        /`INVALID_ROLE` is not a valid enum value/,
      );
    });
  });

  describe("Pre-save Hook", () => {
    test("should normalize name if modified", async () => {
      const mockThis = {
        isModified: vi.fn().mockReturnValue(true),
        name: " John Doe ",
        normalizedName: "",
        password: "password123",
      };

      (normalizeString as any).mockReturnValue("john doe");

      await saveHook.call(mockThis);

      expect(mockThis.isModified).toHaveBeenCalledWith("name");
      expect(normalizeString).toHaveBeenCalledWith(" John Doe ");
      expect(mockThis.normalizedName).toBe("john doe");
    });

    test("should NOT normalize name if NOT modified", async () => {
      const mockThis = {
        isModified: vi.fn((path) => path !== "name"),
        name: "John Doe",
        normalizedName: "existing",
        password: "password123",
      };

      await saveHook.call(mockThis);

      expect(mockThis.isModified).toHaveBeenCalledWith("name");
      expect(normalizeString).not.toHaveBeenCalled();
      expect(mockThis.normalizedName).toBe("existing");
    });

    test("should hash password if modified", async () => {
      const mockThis = {
        isModified: vi.fn().mockReturnValue(true),
        name: "John Doe",
        password: "plainPassword",
      };

      (argon2.hash as any).mockResolvedValue("hashedPassword");

      await saveHook.call(mockThis);

      expect(mockThis.isModified).toHaveBeenCalledWith("password");
      expect(argon2.hash).toHaveBeenCalledWith(
        "plainPassword",
        expect.any(Object),
      );
      expect(mockThis.password).toBe("hashedPassword");
    });

    test("should NOT hash password if NOT modified", async () => {
      const mockThis = {
        isModified: vi.fn((path) => path !== "password"),
        name: "John Doe",
        password: "existingHash",
      };

      await saveHook.call(mockThis);

      expect(mockThis.isModified).toHaveBeenCalledWith("password");
      expect(argon2.hash).not.toHaveBeenCalled();
      expect(mockThis.password).toBe("existingHash");
    });

    test("should throw error if hashing fails", async () => {
      const mockThis = {
        isModified: vi.fn().mockReturnValue(true),
        name: "John Doe",
        password: "plainPassword",
      };

      const error = new Error("Hashing failed");

      (argon2.hash as any).mockRejectedValue(error);

      await expect(saveHook.call(mockThis)).rejects.toThrow("Hashing failed");
    });
  });
});
