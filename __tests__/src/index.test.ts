import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const mockListen = vi.fn();
const mockClose = vi.fn();
const mockBuildApp = vi.fn().mockResolvedValue({
  listen: mockListen,
  close: mockClose,
  log: { info: vi.fn() },
});

vi.mock("@/app", () => ({ default: mockBuildApp }));
vi.mock("@/config/env", () => ({ default: { PORT: 3000 } }));
vi.mock("@/helpers/api-base-url", () => ({ default: "http://localhost:3000" }));
vi.mock("@/helpers/translate", () => ({ default: (key: string) => key }));

describe("src/index.ts", () => {
  let processOnMock: any;
  let processExitMock: any;

  beforeEach(() => {
    vi.resetModules();
    processOnMock = vi.spyOn(process, "on").mockReturnThis();
    processExitMock = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as any);
    mockBuildApp.mockResolvedValue({
      listen: mockListen,
      close: mockClose,
      log: {
        info: vi.fn(),
        error: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test("should start server successfully", async () => {
    await import(`@/index?t=${Date.now()}`);

    expect(mockBuildApp).toHaveBeenCalled();
    expect(mockListen).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 3000,
        host: "0.0.0.0",
      }),
    );

    const listenOptions = mockListen.mock.calls[0][0];

    if (listenOptions.listenTextResolver) {
      listenOptions.listenTextResolver("http://localhost:3000");
    }
  });

  test("should use default port 3300 when PORT is not defined", async () => {
    vi.doMock("@/config/env", () => ({ default: { PORT: undefined } }));

    await import(`@/index?t=${Date.now()}`);

    expect(mockListen).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 3300,
      }),
    );
  });

  test("should handle SIGINT signal", async () => {
    await import(`@/index?t=${Date.now()}`);

    const sigintCall = processOnMock.mock.calls.find(
      (call: any) => call[0] === "SIGINT",
    );

    expect(sigintCall).toBeDefined();

    const handler = sigintCall[1];

    await handler();

    expect(mockClose).toHaveBeenCalled();
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  test("should handle SIGTERM signal", async () => {
    await import(`@/index?t=${Date.now()}`);

    const sigtermCall = processOnMock.mock.calls.find(
      (call: any) => call[0] === "SIGTERM",
    );

    expect(sigtermCall).toBeDefined();

    const handler = sigtermCall[1];

    await handler();

    expect(mockClose).toHaveBeenCalled();
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  test("should handle startup errors", async () => {
    const error = new Error("Startup failed");
    mockBuildApp.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await import(`@/index?t=${Date.now()}`);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(processExitMock).toHaveBeenCalledWith(1);
  });
});
