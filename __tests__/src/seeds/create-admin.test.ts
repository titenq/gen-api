import { beforeEach, describe, expect, test, vi } from "vitest";

import UserModel from "@/models/User.model";
import createAdmin from "@/seeds/create-admin";

vi.mock("@/models/User.model");
vi.mock("@/config/env", () => ({
  default: {
    ADMIN_NAME: "Admin",
    ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: "password",
  },
}));

describe("createAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should create admin if no users exist", async () => {
    (UserModel.countDocuments as any).mockResolvedValue(0);
    (UserModel.create as any).mockResolvedValue({});

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await createAdmin();

    expect(UserModel.create).toHaveBeenCalledWith({
      name: "Admin",
      email: "admin@example.com",
      password: "password",
      roles: ["ADMIN", "USER"],
      isEmailVerified: true,
    });
    expect(consoleSpy).toHaveBeenCalledWith("User ADMIN created successfully.");
  });

  test("should not create admin if users exist", async () => {
    (UserModel.countDocuments as any).mockResolvedValue(1);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await createAdmin();

    expect(UserModel.create).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("User ADMIN already exists.");
  });
});
