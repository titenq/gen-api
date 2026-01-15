import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

describe("mongo-init/init.js", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };

    global.db = {
      createUser: vi.fn(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    delete global.db;
    vi.clearAllMocks();
  });

  test("should create user with environment variables", async () => {
    process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
    process.env.MONGO_INITDB_ROOT_PASSWORD = "testpassword";
    process.env.MONGO_INITDB_DATABASE = "testdb";

    await import("../../mongo-init/init.js");

    expect(global.db.createUser).toHaveBeenCalledWith({
      user: "testuser",
      pwd: "testpassword",
      roles: [{ role: "readWrite", db: "testdb" }],
    });
  });
});
