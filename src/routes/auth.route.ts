import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import verifyRecaptcha from "@/handlers/verify-recaptcha.handler";
import * as authController from "@/controllers/auth";
import * as authSchema from "@/schemas/auth";
import { AuthInterface } from "@/interfaces";

const authRoute = async (fastify: FastifyInstance) => {
  const routeOptions = fastify.withTypeProvider<ZodTypeProvider>();

  routeOptions.post<{
    Body: AuthInterface.IRegisterBody;
    Headers: AuthInterface.IRegisterHeaders;
  }>(
    "/auth/register",
    {
      schema: authSchema.registerSchema,
      preHandler: [verifyRecaptcha],
    },
    authController.register,
  );

  routeOptions.post<{
    Headers: AuthInterface.ILoginHeaders;
    Body: AuthInterface.ILoginBody;
  }>(
    "/auth/login",
    {
      schema: authSchema.loginSchema,
      preHandler: [verifyRecaptcha],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
          ban: 5,
        },
      },
    },
    authController.login,
  );

  routeOptions.post<{
    Headers: AuthInterface.ILogoutHeaders;
  }>(
    "/auth/logout",
    { schema: authSchema.logoutSchema },
    authController.logout,
  );

  routeOptions.post<{
    Body: AuthInterface.IVerifyEmailBody;
  }>(
    "/auth/verify-email",
    { schema: authSchema.verifyEmailSchema },
    authController.verifyEmail,
  );

  routeOptions.post(
    "/auth/resend-link",
    { schema: authSchema.resendLinkSchema },
    authController.resendLink,
  );

  routeOptions.post<{
    Body: AuthInterface.IForgotPasswordBody;
    Headers: AuthInterface.IForgotPasswordHeaders;
  }>(
    "/auth/forgot-password",
    {
      schema: authSchema.forgotPasswordSchema,
      preHandler: [verifyRecaptcha],
    },
    authController.forgotPassword,
  );

  routeOptions.post<{
    Body: AuthInterface.IResetPasswordBody;
  }>(
    "/auth/reset-password",
    { schema: authSchema.resetPasswordSchema },
    authController.resetPassword,
  );

  routeOptions.post(
    "/auth/refresh-token",
    { schema: authSchema.refreshTokenSchema },
    authController.refreshToken,
  );
};

export default authRoute;
