import { FastifyInstance } from "fastify";

import { EMAIL_VERIFICATION_TOKEN_EXPIRES } from "@/constants/constants";
import createErrorMessage from "@/helpers/create-error-message";
import siteOrigin from "@/helpers/site-origin";
import { AuthInterface, ErrorInterface } from "@/interfaces";
import forgotPasswordRepository from "@/repositories/auth/forgot-password.repository";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";

const forgotPasswordService = async (
  fastify: FastifyInstance,
  forgotPassword: AuthInterface.IForgotPasswordBody,
): Promise<
  AuthInterface.IForgotPasswordResponse | ErrorInterface.IGenericError
> => {
  try {
    const { email } = forgotPassword;

    const user = await getUserByEmailRepository(email);

    if (!user) {
      return createErrorMessage("error.auth.userNotFound", 404);
    }

    const token = fastify.jwt.sign(
      { _id: user._id },
      { expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES },
    );

    await forgotPasswordRepository(user._id.toString(), token);

    const forgotPasswordLink = `${siteOrigin}/forgot-password?token=${token}`;

    await fastify.rabbitMQ.publishMessage(
      "send_forgot_password_queue",
      JSON.stringify({
        userEmail: user.email,
        forgotPasswordLink,
      }),
    );

    return {
      message: fastify.i18n("message.auth.linkResetPasswordSuccess"),
    };
  } catch (_error) {
    return createErrorMessage("error.auth.resetPasswordLinkError");
  }
};

export default forgotPasswordService;
