import translate from "@/helpers/translate";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("mongoose", () => {
  const mMongoose = {
    connect: vi.fn(),
    connection: {
      useDb: vi.fn(),
    },
    set: vi.fn(),
    Promise: global.Promise,
  };

  return { default: mMongoose };
});

vi.mock("@/seeds/create-admin", () => ({
  default: vi.fn(),
}));

describe("src/db/index.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should connect to MongoDB successfully and create admin", async () => {
    const mongoose = (await import("mongoose")).default;
    const createAdmin = (await import("@/seeds/create-admin")).default;

    (mongoose.connect as any).mockResolvedValueOnce(mongoose);

    await import("@/db/index");

    expect(mongoose.connect).toHaveBeenCalled();
    expect(mongoose.connection.useDb).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      translate("message.mongodb.success"),
    );
    expect(createAdmin).toHaveBeenCalled();
  });

  test("should log error if connection fails", async () => {
    const mongoose = (await import("mongoose")).default;

    (mongoose.connect as any).mockRejectedValueOnce(
      new Error("Connection failed"),
    );

    await import("@/db/index");

    expect(mongoose.connect).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      translate("message.mongodb.error"),
    );
  });
});
