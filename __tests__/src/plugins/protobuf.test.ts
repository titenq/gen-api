import fs from "node:fs";
import path from "node:path";

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import protobuf from "protobufjs";

import protobufPlugin from "@/plugins/protobuf";

vi.mock("fs");
vi.mock("protobufjs", () => {
  class Type {
    fullName: string;
    constructor(name: string) {
      this.fullName = name;
    }
    verify = vi.fn();
    create = vi.fn();
    encode = vi.fn();
  }

  class Namespace {
    name: string;
    nested: any;
    constructor(name: string, nested: any) {
      this.name = name;
      this.nested = nested;
    }
  }

  return {
    default: {
      load: vi.fn(),
      Type,
      Namespace,
    },
  };
});

describe("protobufPlugin", () => {
  let mockFastify: any;
  let hooks: Record<string, Function>;

  beforeEach(() => {
    hooks = {};
    mockFastify = {
      decorate: vi.fn(),
      addHook: vi.fn((name, handler) => {
        hooks[name] = handler;
      }),
      log: {
        error: vi.fn(),
      },
    };

    vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);

    (protobuf.load as any).mockResolvedValue(
      new protobuf.Namespace("root", {}),
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should load proto files and decorate fastify", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".TestType");
    const mockRoot = new protobuf.Namespace("root", {
      TestType: mockType,
    });

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    expect(fs.readdirSync).toHaveBeenCalledWith("/test/proto");
    expect(protobuf.load).toHaveBeenCalledWith(
      path.join("/test/proto", "test.proto"),
    );
    expect(mockFastify.decorate as any).toHaveBeenCalledWith(
      "protobuf",
      expect.any(Object),
    );

    const decorated = mockFastify.decorate.mock.calls[0][1];

    expect(decorated.types["TestType"]).toBe(mockType);
    expect(decorated.getType("TestType")).toBe(mockType);
  });

  test("should handle serialization hook for application/x-protobuf", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".TestType");
    mockType.verify = vi.fn().mockReturnValue(null);
    mockType.create = vi.fn((payload) => payload);
    mockType.encode = vi.fn().mockReturnValue({
      finish: vi.fn().mockReturnValue(Buffer.from("encoded")),
    });

    const mockRoot = new protobuf.Namespace("root", {
      TestType: mockType,
    });
    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = {
      protobufType: "TestType",
      header: vi.fn(),
    };
    const payload = { data: "test" };
    const result = await hook(request, reply, payload);

    expect(mockType.verify).toHaveBeenCalledWith(payload);
    expect(mockType.create).toHaveBeenCalledWith(payload);
    expect(mockType.encode).toHaveBeenCalled();
    expect(reply.header).toHaveBeenCalledWith(
      "Content-Type",
      "application/x-protobuf",
    );
    expect(result).toEqual(Buffer.from("encoded"));
  });

  test("should return payload if accept header is missing", async () => {
    await protobufPlugin(mockFastify as FastifyInstance, {});

    const hook = hooks["preSerialization"];
    const request: any = { headers: {}, routeOptions: { config: {} } };
    const reply: any = {};
    const payload = { data: "test" };
    const result = await hook(request, reply, payload);

    expect(result).toBe(payload);
  });

  test("should return payload if payload is already a buffer", async () => {
    await protobufPlugin(mockFastify as FastifyInstance, {});

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = {};
    const payload = Buffer.from("test");
    const result = await hook(request, reply, payload);

    expect(result).toBe(payload);
  });

  test("should transform payload (dates and _id)", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".TestType");

    mockType.verify = vi.fn().mockReturnValue(null);
    mockType.create = vi.fn((payload) => payload);
    mockType.encode = vi.fn().mockReturnValue({
      finish: vi.fn().mockReturnValue(Buffer.from("encoded")),
    });

    const mockRoot = new protobuf.Namespace("root", {
      TestType: mockType,
    });

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = { protobufType: "TestType", header: vi.fn() };
    const date = new Date("2023-01-01T00:00:00Z");
    const payload = {
      _id: 123,
      createdAt: date,
      updatedAt: date,
    };

    await hook(request, reply, payload);

    expect(mockType.create).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "123",
        createdAt: expect.objectContaining({ seconds: expect.any(Number) }),
        updatedAt: expect.objectContaining({ seconds: expect.any(Number) }),
      }),
    );
  });

  test("should handle generic errors", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".error.GenericError");

    mockType.verify = vi.fn().mockReturnValue(null);
    mockType.create = vi.fn((payload) => payload);
    mockType.encode = vi.fn().mockReturnValue({
      finish: vi.fn().mockReturnValue(Buffer.from("encoded")),
    });

    const mockRoot = new protobuf.Namespace("root", {
      error: new protobuf.Namespace("error", {
        GenericError: mockType,
      }),
    });

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = { header: vi.fn() };
    const payload = { error: true, message: "Error" };
    const result = await hook(request, reply, payload);

    expect(mockType.create).toHaveBeenCalled();
    expect(result).toEqual(Buffer.from("encoded"));
  });

  test("should return payload (fallback JSON) if protobufType is missing", async () => {
    await protobufPlugin(mockFastify as FastifyInstance, {});

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = {};
    const payload = { data: "test" };
    const result = await hook(request, reply, payload);

    expect(result).toEqual(payload);
  });

  test("should log error and return payload if type is not found", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockRoot = new protobuf.Namespace("root", {});
    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = { protobufType: "NonExistentType" };
    const payload = { data: "test" };
    const result = await hook(request, reply, payload);

    expect(mockFastify.log.error).toHaveBeenCalledWith(
      expect.stringContaining("Protobuf type not found"),
    );
    expect(result).toEqual(payload);
  });

  test("should log error and return payload if payload is invalid", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".TestType");
    mockType.verify = vi.fn().mockReturnValue("Invalid field");

    const mockRoot = new protobuf.Namespace("root", {
      TestType: mockType,
    });
    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = { protobufType: "TestType" };
    const payload = { data: "test" };
    const result = await hook(request, reply, payload);

    expect(mockType.verify).toHaveBeenCalledWith(payload);
    expect(mockFastify.log.error).toHaveBeenCalledWith(
      expect.stringContaining("Invalid payload"),
    );
    expect(result).toEqual(payload);
  });

  test("should handle namespace without nested types", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockRoot = new protobuf.Namespace("root", {});
    mockRoot.nested = undefined;

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const decorated = mockFastify.decorate.mock.calls[0][1];

    expect(decorated.types).toEqual({});
  });
  test("should collect types from nested namespaces recursively", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockType = new protobuf.Type(".NestedType");
    const nestedNamespace = new protobuf.Namespace("nested", {
      NestedType: mockType,
    });
    const mockRoot = new protobuf.Namespace("root", {
      nestedPackage: nestedNamespace,
    });

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const decorated = mockFastify.decorate.mock.calls[0][1];
    expect(decorated.types["NestedType"]).toBe(mockType);
  });

  test("should handle primitive payload (not object) correctly", async () => {
    await protobufPlugin(mockFastify as FastifyInstance, {});

    const hook = hooks["preSerialization"];
    const request: any = {
      headers: { accept: "application/x-protobuf" },
      routeOptions: { config: {} },
    };
    const reply: any = {};
    const payload = "primitive string payload";
    const result = await hook(request, reply, payload);

    expect(result).toBe(payload);
  });

  test("should ignore nested items that are not Type or Namespace", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["test.proto"] as any);

    const mockRoot = new protobuf.Namespace("root", {
      IgnoredItem: { some: "object" } as any,
    });

    (protobuf.load as any).mockResolvedValue(mockRoot);

    await protobufPlugin(mockFastify as FastifyInstance, {
      protoDir: "/test/proto",
    });

    const decorated = mockFastify.decorate.mock.calls[0][1];
    expect(decorated.types).toEqual({});
  });
});
