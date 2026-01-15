import { describe, expect, test, vi } from "vitest";

import protoService from "@/services/proto/proto.service";

const mockOn = vi.fn();
const mockDirectory = vi.fn();
const mockFinalize = vi.fn();

vi.mock("archiver", () => ({
  default: () => ({
    on: mockOn,
    directory: mockDirectory,
    finalize: mockFinalize,
  }),
}));

describe("Proto Service", () => {
  test("should return a buffer that is a valid zip file", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "data") {
        callback(Buffer.from("mock data"));
      }
      if (event === "end") {
        callback();
      }
    });

    const result = await protoService();

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe("mock data");
  });

  test("should catch error", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "error") {
        callback(new Error("Mock error"));
      }
    });

    await expect(protoService()).rejects.toThrow("Mock error");
  });
});
