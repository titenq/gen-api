import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";

vi.mock("@/helpers/translate", () => ({ default: (key: string) => key }));

describe("src/config/env.ts", () => {
  const originalEnv = process.env;
  const originalProcessExit = process.exit;
  const mockProcessExit = vi.fn() as unknown as Mock &
    ((code?: number) => never);
  const mockConsoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  const mockLoadEnvFile = vi
    .spyOn(process, "loadEnvFile")
    .mockImplementation(() => {});

  const validEnv = {
    PORT: "3000",
    ORIGIN: "http://localhost:3000",
    API_PREFIX: "/api/v1",
    API_URL: "http://localhost:3000/api/v1",
    ACCEPT_LANGUAGE: "en-US",
    ADMIN_NAME: "Admin",
    ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: "password",
    DB_USER: "user",
    DB_PASSWORD: "password",
    DB_HOST: "localhost",
    DB_PORT: "27017",
    DB_NAME: "db",
    REDIS_HOST: "localhost",
    REDIS_PORT: "6379",
    REDIS_PASSWORD: "password",
    GRAFANA_USER: "admin",
    GRAFANA_PASSWORD: "password",
    RABBITMQ_USER: "user",
    RABBITMQ_PASSWORD: "password",
    ENC_KEY: "key",
    IV: "iv",
    COOKIE_SECRET: "secret",
    JWT_SECRET: "secret",
    EMAIL_USER: "email@example.com",
    EMAIL_APP_PASSWORD: "password",
    EMAIL_SERVICE: "gmail",
    RECAPTCHA_SECRET_KEY: "secret",
    NODE_ENV: "test",
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.exit = mockProcessExit;
    mockConsoleError.mockClear();
    mockLoadEnvFile.mockClear();
    mockProcessExit.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalProcessExit;
  });

  test("should load valid environment variables", async () => {
    process.env = { ...validEnv };

    const env = (await import("@/config/env")).default;

    expect(process.loadEnvFile).toHaveBeenCalled();

    expect(env).toBeDefined();
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("test");
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  test("should exit process if environment variables are invalid", async () => {
    process.env = {};

    await import("@/config/env");

    expect(process.loadEnvFile).toHaveBeenCalled();
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    expect(mockConsoleError).toHaveBeenCalled();
  });
});
