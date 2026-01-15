import { FastifyInstance } from "fastify";

import createErrorMessage from "@/helpers/create-error-message";
import { AuthInterface, ErrorInterface, JwtInterface } from "@/interfaces";
import {
  getUserByForgotPasswordTokenRepository,
  updatePasswordRepository,
} from "@/repositories/auth/reset-password.repository";

const resetPasswordService = async (
  fastify: FastifyInstance,
  resetPasswordBody: AuthInterface.IResetPasswordBody,
): Promise<
  AuthInterface.IResetPasswordResponse | ErrorInterface.IGenericError
> => {
  try {
    const { token, password } = resetPasswordBody;

    fastify.jwt.verify<JwtInterface.IJwtPayload>(token);

    const user = await getUserByForgotPasswordTokenRepository(token);

    if (!user) {
      return createErrorMessage("error.auth.resetPasswordTokenNotFound", 404);
    }

    await updatePasswordRepository(user, password);

    return {
      message: fastify.i18n("message.auth.resetPasswordSuccess"),
    };
  } catch (error) {
    if ((error as JwtInterface.IJwtError).code === "FAST_JWT_EXPIRED") {
      return createErrorMessage("error.auth.resetPasswordTokenExpired", 401);
    }

    return createErrorMessage("error.auth.resetPasswordError");
  }
};

export default resetPasswordService;
