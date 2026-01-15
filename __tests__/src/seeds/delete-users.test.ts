import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import UserModel from "@/models/User.model";

vi.mock("@/models/User.model");

describe("deleteUsers", () => {
  let processExitSpy: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as any);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should delete users and exit with 0", async () => {
    (UserModel.deleteMany as any).mockResolvedValue({ deletedCount: 10 });

    await import("@/seeds/delete-users");

    expect(UserModel.deleteMany).toHaveBeenCalledWith({
      name: { $regex: /^FakeUser / },
    });
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("FakeUsers deleted"),
    );
  });

  test("should handle errors and exit with 1", async () => {
    (UserModel.deleteMany as any).mockRejectedValue(new Error("Fail"));

    await import("@/seeds/delete-users");

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting users:",
      expect.any(Error),
    );
  });
});
