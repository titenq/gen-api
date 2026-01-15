import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import authRoutes from "@/routes/auth.route";
import verifyRecaptcha from "@/handlers/verify-recaptcha.handler";
import * as authController from "@/controllers/auth";
import * as authSchema from "@/schemas/auth";
import { xRecaptchaTokenSchema } from "@/schemas/shared";

describe("authRoute", () => {
  let fastify: FastifyInstance;
  let postMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMock = vi.fn();

    fastify = {
      withTypeProvider: () => ({ post: postMock }),
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should register POST /auth/register with correct schema and verifyRecaptcha", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find((c) => c[0] === "/auth/register")!;
    const [path, options, handler] = call;

    expect(path).toBe("/auth/register");
    expect(handler).toBe(authController.register);
    expect(options.schema).toBe(authSchema.registerSchema);
    expect(options.preHandler).toContain(verifyRecaptcha);
  });

  test("should fail when recaptcha token is invalid", () => {
    const result = xRecaptchaTokenSchema.safeParse("invalid-token");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "validation.xRecaptchaToken.invalidFormat",
    );
  });

  test("should register POST /auth/login with correct schema, preHandler and rateLimit", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find((c) => c[0] === "/auth/login")!;
    const [path, options, handler] = call;

    expect(path).toBe("/auth/login");
    expect(handler).toBe(authController.login);
    expect(options.schema).toBe(authSchema.loginSchema);
    expect(options.preHandler).toContain(verifyRecaptcha);
    expect(options.config?.rateLimit).toEqual({
      max: 5,
      timeWindow: "1 minute",
      ban: 5,
    });
  });

  test("should register POST /auth/logout with correct schema", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find((c) => c[0] === "/auth/logout")!;
    const [path, options, handler] = call;

    expect(path).toBe("/auth/logout");
    expect(handler).toBe(authController.logout);
    expect(options.schema).toBe(authSchema.logoutSchema);
  });

  test("should register POST /auth/verify-email with correct schema", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find(
      (c) => c[0] === "/auth/verify-email",
    )!;

    const [path, options, handler] = call;

    expect(path).toBe("/auth/verify-email");
    expect(handler).toBe(authController.verifyEmail);
    expect(options.schema).toBe(authSchema.verifyEmailSchema);
  });

  test("should register POST /auth/resend-link with correct schema", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find((c) => c[0] === "/auth/resend-link")!;
    const [path, options, handler] = call;

    expect(path).toBe("/auth/resend-link");
    expect(handler).toBe(authController.resendLink);
    expect(options.schema).toBe(authSchema.resendLinkSchema);
  });

  test("should register POST /auth/forgot-password with correct schema and preHandler", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find(
      (c) => c[0] === "/auth/forgot-password",
    )!;

    const [path, options, handler] = call;

    expect(path).toBe("/auth/forgot-password");
    expect(handler).toBe(authController.forgotPassword);
    expect(options.schema).toBe(authSchema.forgotPasswordSchema);
    expect(options.preHandler).toContain(verifyRecaptcha);
  });

  test("should register POST /auth/reset-password with correct schema", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find(
      (c) => c[0] === "/auth/reset-password",
    )!;

    const [path, options, handler] = call;

    expect(path).toBe("/auth/reset-password");
    expect(handler).toBe(authController.resetPassword);
    expect(options.schema).toBe(authSchema.resetPasswordSchema);
  });

  test("should register POST /auth/refresh-token with correct schema", async () => {
    await authRoutes(fastify);

    const call = postMock.mock.calls.find(
      (c) => c[0] === "/auth/refresh-token",
    )!;

    const [path, options, handler] = call;

    expect(path).toBe("/auth/refresh-token");
    expect(handler).toBe(authController.refreshToken);
    expect(options.schema).toBe(authSchema.refreshTokenSchema);
  });
});
