import fs from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

import { describe, test, expect, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";

import logRotate from "@/helpers/log-rotate";

vi.mock("nodemailer");
vi.mock("node:fs");
vi.mock("@/config/env", () => ({
  default: {
    EMAIL_USER: "test@example.com",
    EMAIL_APP_PASSWORD: "password",
    EMAIL_SERVICE: "gmail",
    ADMIN_EMAIL: "admin@example.com",
  },
}));
vi.mock("@/helpers/get-app-name", () => ({
  default: () => "Test App",
}));
vi.mock("@/helpers/translate", () => ({
  default: (key: string, params?: any) => {
    if (params) {
      return `${key} ${JSON.stringify(params)}`;
    }
    return key;
  },
}));

describe("logRotate", () => {
  const logDir = join(cwd(), "logs");
  let sendMailMock: any;
  let createTransportMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    (fs.existsSync as any).mockReturnValue(true);
    (fs.mkdirSync as any).mockImplementation(() => {});
    (fs.createWriteStream as any).mockReturnValue({
      write: vi.fn(),
      end: vi.fn(),
    });

    sendMailMock = vi.fn().mockResolvedValue({ messageId: "123" });
    createTransportMock = { sendMail: sendMailMock };
    (nodemailer.createTransport as any).mockReturnValue(createTransportMock);
    (fs.readdirSync as any).mockReturnValue([]);
    (fs.chmodSync as any).mockImplementation(() => {});
    (fs.statSync as any).mockReturnValue({
      size: 0,
      birthtime: new Date(),
    });
  });

  test("should create a new log file on initialization", () => {
    (fs.readdirSync as any).mockReturnValue([]);

    logRotate();

    expect(fs.createWriteStream).toHaveBeenCalled();
  });

  test("should rotate when file size limit is reached", () => {
    (fs.readdirSync as any).mockReturnValue([]);
    (fs.statSync as any).mockReturnValue({
      size: 1024 * 1024 + 1,
      birthtime: new Date(),
    });

    const stream = logRotate(1024 * 1024);
    stream.write("test log");

    expect(fs.createWriteStream).toHaveBeenCalledTimes(2);
  });

  test("should send email and delete old file when 4th file is created", async () => {
    const mockFiles = [
      { name: "app-1.log", birthtime: new Date("2023-01-01") },
      { name: "app-2.log", birthtime: new Date("2023-01-02") },
      { name: "app-3.log", birthtime: new Date("2023-01-03") },
      { name: "app-4.log", birthtime: new Date("2023-01-04") },
      { name: "app-5.log", birthtime: new Date("2023-01-05") },
    ];

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);
      return {
        size: fileName === "app-5.log" ? 10 * 1024 * 1024 : 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@example.com",
        attachments: expect.arrayContaining([
          expect.objectContaining({ filename: "app-1.log" }),
        ]),
      }),
    );
    expect(fs.unlinkSync).toHaveBeenCalledWith(join(logDir, "app-1.log"));
  });

  test("should create logs directory if it does not exist", () => {
    logRotate();

    expect(fs.mkdirSync).toHaveBeenCalledWith(logDir, { recursive: true });
  });

  test("should handle email sending errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockFiles = [
      { name: "app-1.log", birthtime: new Date("2023-01-01") },
      { name: "app-2.log", birthtime: new Date("2023-01-02") },
      { name: "app-3.log", birthtime: new Date("2023-01-03") },
      { name: "app-4.log", birthtime: new Date("2023-01-04") },
      { name: "app-5.log", birthtime: new Date("2023-01-05") },
    ];

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);
      return {
        size: fileName === "app-5.log" ? 10 * 1024 * 1024 : 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    sendMailMock.mockRejectedValue(new Error("Email failed"));

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith(
      "message.logRotate.errorEmail",
      expect.any(Error),
    );

    expect(fs.unlinkSync).toHaveBeenCalledWith(join(logDir, "app-1.log"));
  });

  test("should handle file deletion errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockFiles = [
      { name: "app-1.log", birthtime: new Date("2023-01-01") },
      { name: "app-2.log", birthtime: new Date("2023-01-02") },
      { name: "app-3.log", birthtime: new Date("2023-01-03") },
      { name: "app-4.log", birthtime: new Date("2023-01-04") },
      { name: "app-5.log", birthtime: new Date("2023-01-05") },
    ];

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);
      return {
        size: fileName === "app-5.log" ? 10 * 1024 * 1024 : 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    (fs.unlinkSync as any).mockImplementation(() => {
      throw new Error("Delete failed");
    });

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith(
      `message.logRotate.errorDeleteLog {"filePath":"${join(logDir, "app-1.log")}"}`,
      expect.any(Error),
    );
  });

  test("should handle errors during rotation check", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (fs.readdirSync as any).mockReturnValue([]);
    (fs.statSync as any).mockImplementation(() => {
      throw new Error("Stat failed");
    });

    const stream = logRotate(1024);
    stream.write("test");

    expect(consoleSpy).toHaveBeenCalledWith(
      "message.logRotate.errorRotate",
      expect.any(Error),
    );
  });

  test("should handle error in pruneFiles catch block", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockFiles = Array.from({ length: 6 }, (_, i) => ({
      name: `app-${i + 1}.log`,
      birthtime: new Date(),
    }));

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);
      return {
        size: 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    (nodemailer.createTransport as any).mockImplementation(() => {
      throw new Error("Transport creation failed");
    });

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith(
      "message.logRotate.errorEmail",
      expect.any(Error),
    );
  });

  test("should reuse existing log file on init if valid", () => {
    const mockFiles = [
      { name: "app-1.log", birthtime: new Date("2023-01-01") },
    ];
    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation(() => ({
      size: 100,
      birthtime: new Date(),
    }));

    logRotate();

    expect(fs.createWriteStream).toHaveBeenCalledWith(
      join(logDir, "app-1.log"),
      expect.objectContaining({ flags: "a" }),
    );
  });

  test("should prune excess files on init even if reusing latest", async () => {
    const mockFiles = Array.from({ length: 6 }, (_, i) => ({
      name: `app-${i + 1}.log`,
      birthtime: new Date(2023, 0, i + 1),
    }));

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);

      return {
        size: 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalledWith(join(logDir, "app-1.log"));
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      join(logDir, "app-6.log"),
      expect.objectContaining({ flags: "a" }),
    );
  });

  test("should handle statSync error during init check", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockFiles = [{ name: "app-1.log", birthtime: new Date() }];

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));

    let callCount = 0;

    (fs.statSync as any).mockImplementation(() => {
      callCount++;

      if (callCount === 2) {
        throw new Error("Init stat failed");
      }

      return {
        size: 100,
        birthtime: new Date(),
      };
    });

    logRotate();

    expect(consoleSpy).toHaveBeenCalledWith(
      "message.logRotate.errorCheckLatest",
      expect.any(Error),
    );
    expect(fs.createWriteStream).toHaveBeenCalled();
  });

  test("should not delete file if it does not exist in finally block", async () => {
    const mockFiles = [
      { name: "app-1.log", birthtime: new Date("2023-01-01") },
      { name: "app-2.log", birthtime: new Date("2023-01-02") },
      { name: "app-3.log", birthtime: new Date("2023-01-03") },
      { name: "app-4.log", birthtime: new Date("2023-01-04") },
      { name: "app-5.log", birthtime: new Date("2023-01-05") },
    ];

    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));
    (fs.statSync as any).mockImplementation((path: string) => {
      const fileName = path.split("/").pop();
      const file = mockFiles.find((f) => f.name === fileName);
      return {
        size: fileName === "app-5.log" ? 10 * 1024 * 1024 : 100,
        birthtime: file ? file.birthtime : new Date(),
      };
    });

    (fs.existsSync as any).mockReturnValue(false);

    logRotate();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  test("should handle error during rotation in write", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    (fs.readdirSync as any).mockReturnValue([]);

    (fs.statSync as any).mockImplementation(() => {
      return { size: 1024 * 1024 * 10, birthtime: new Date() };
    });

    (fs.statSync as any).mockImplementation(() => {
      return { size: 1024 * 1024 * 10, birthtime: new Date() };
    });

    (fs.readdirSync as any)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockImplementationOnce(() => {
        throw new Error("Rotation failed");
      });

    const stream = logRotate(1024);

    stream.write("test data");

    expect(consoleSpy).toHaveBeenCalledWith(
      "message.logRotate.errorRotate",
      expect.any(Error),
    );
  });

  test("should silently ignore write if stream is not initialized", () => {
    (fs.createWriteStream as any).mockReturnValue(null);

    const stream = logRotate();

    expect(() => stream.write("test")).not.toThrow();
  });

  test("should rotate log file during write if size limit is exceeded", () => {
    const mockFiles = [{ name: "app-1.log", birthtime: new Date() }];
    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));

    let callCount = 0;
    (fs.statSync as any).mockImplementation(() => {
      callCount++;

      if (callCount <= 2) {
        return { size: 100, birthtime: new Date() };
      }

      return { size: 1024 * 1024 * 10, birthtime: new Date() };
    });

    const stream = logRotate(1024 * 1024);

    (fs.createWriteStream as any).mockClear();

    stream.write("test data");

    expect(fs.createWriteStream).toHaveBeenCalled();
  });

  test("should write to existing file without rotating if size is within limits", () => {
    const mockFiles = [{ name: "app-1.log", birthtime: new Date() }];
    (fs.readdirSync as any).mockReturnValue(mockFiles.map((f) => f.name));

    (fs.statSync as any).mockReturnValue({
      size: 100,
      birthtime: new Date(),
    });

    const stream = logRotate(1024 * 1024);

    expect(fs.createWriteStream).toHaveBeenCalledTimes(1);

    stream.write("test data");

    expect(fs.createWriteStream).toHaveBeenCalledTimes(1);

    const mockStream = (fs.createWriteStream as any).mock.results[0].value;

    expect(mockStream.write).toHaveBeenCalledWith("test data");
  });
});
