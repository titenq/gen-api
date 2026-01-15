import { describe, expect, test, vi } from "vitest";

import protoController from "@/controllers/proto/proto.controller";

const mockProtoService = vi.fn();
const mockGetAppName = vi.fn();

vi.mock("@/services/proto/proto.service", () => ({
  default: () => mockProtoService(),
}));

vi.mock("@/helpers/get-app-name", () => ({
  default: () => mockGetAppName(),
}));

describe("Proto Controller", () => {
  test("should handle request successfully", async () => {
    const mockRequest = {} as any;
    const mockReply = {
      header: vi.fn(),
      send: vi.fn(),
    } as any;

    const mockBuffer = Buffer.from("mock data");
    mockProtoService.mockResolvedValue(mockBuffer);
    mockGetAppName.mockReturnValue("test-app");

    await protoController(mockRequest, mockReply);

    expect(mockProtoService).toHaveBeenCalled();
    expect(mockReply.header).toHaveBeenCalledWith(
      "Content-Type",
      "application/zip",
    );
    expect(mockReply.header).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="test-app_proto.zip"',
    );
    expect(mockReply.send).toHaveBeenCalledWith(mockBuffer);
  });
});
