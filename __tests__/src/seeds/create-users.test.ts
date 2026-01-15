import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import UserModel from "@/models/User.model";

vi.mock("@/models/User.model");

describe("createUsers", () => {
  let processExitSpy: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as any);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("should create users and exit with 0", async () => {
    (UserModel.create as any).mockResolvedValue({});

    await import("@/seeds/create-users");

    await vi.advanceTimersByTimeAsync(6000);

    expect(UserModel.create).toHaveBeenCalledTimes(100);
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("users created successfully"),
    );
  });

  test("should handle errors and continue", async () => {
    (UserModel.create as any)
      .mockRejectedValueOnce(new Error("Fail"))
      .mockResolvedValue({});

    await import("@/seeds/create-users");

    await vi.advanceTimersByTimeAsync(6000);

    expect(UserModel.create).toHaveBeenCalledTimes(100);
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("users failed"),
    );
  });
  test("should handle fatal errors", async () => {
    processExitSpy.mockImplementationOnce(() => {
      throw new Error("Fatal Error");
    });

    await import("@/seeds/create-users");

    await vi.advanceTimersByTimeAsync(6000);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating users:",
      expect.any(Error),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
