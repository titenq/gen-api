import mongoose from "mongoose";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import mongoDBService from "@/services/health/mongodb.service";
import { MongoDBStatus } from "@/enums/health.enum";

vi.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connection: {},
  },
}));

describe("mongoDBService", () => {
  const mockPing = vi.fn();
  let dateSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    (mongoose as any).connection = {
      readyState: 1,
      db: {
        admin: vi.fn(() => ({
          ping: mockPing,
        })),
      },
    };
  });

  afterEach(() => {
    if (dateSpy) {
      dateSpy.mockRestore();
      dateSpy = null;
    }
  });

  test("should return OK status and latency when connection is ready", async () => {
    mockPing.mockResolvedValueOnce(undefined);
    const now = Date.now();
    dateSpy = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 50);

    const result = await mongoDBService();

    expect(result.status).toBe(MongoDBStatus.OK);
    expect(result.latency).toBe(50);
  });

  test("should return DOWN when connection is not ready", async () => {
    (mongoose as any).connection = { readyState: 0 };

    const result = await mongoDBService();

    expect(result.status).toBe(MongoDBStatus.DOWN);
    expect(result.error).toBe("MongoDB connection not ready");
  });

  test("should return DOWN when ping throws error", async () => {
    mockPing.mockRejectedValueOnce(new Error("Ping failed"));

    const result = await mongoDBService();

    expect(result.status).toBe(MongoDBStatus.DOWN);
    expect(result.error).toBe("MongoDB connection failed");
  });

  test("should return DOWN when db or admin is missing", async () => {
    (mongoose as any).connection = {
      readyState: 1,
      db: {
        admin: undefined,
      },
    };

    const result = await mongoDBService();

    expect(result.status).toBe(MongoDBStatus.DOWN);
    expect(result.error).toBe("MongoDB connection failed");
  });
});
