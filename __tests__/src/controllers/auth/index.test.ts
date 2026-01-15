import { describe, test, expect } from "vitest";

import * as authControllers from "@/controllers/auth";
import forgotPassword from "@/controllers/auth/forgot-password.controller";
import login from "@/controllers/auth/login.controller";
import logout from "@/controllers/auth/logout.controller";
import refreshToken from "@/controllers/auth/refresh-token.controller";
import register from "@/controllers/auth/register.controller";
import resendLink from "@/controllers/auth/resend-link.controller";
import resetPassword from "@/controllers/auth/reset-password.controller";
import verifyEmail from "@/controllers/auth/verify-email.controller";

describe("Auth Controllers Index", () => {
  test("should export all auth controllers", () => {
    expect(authControllers.forgotPassword).toBe(forgotPassword);
    expect(authControllers.login).toBe(login);
    expect(authControllers.logout).toBe(logout);
    expect(authControllers.refreshToken).toBe(refreshToken);
    expect(authControllers.register).toBe(register);
    expect(authControllers.resendLink).toBe(resendLink);
    expect(authControllers.resetPassword).toBe(resetPassword);
    expect(authControllers.verifyEmail).toBe(verifyEmail);
  });
});
