import { FastifyInstance } from "fastify";

import { EMAIL_VERIFICATION_TOKEN_EXPIRES } from "@/constants/constants";
import createErrorMessage from "@/helpers/create-error-message";
import siteOrigin from "@/helpers/site-origin";
import { AuthInterface, ErrorInterface } from "@/interfaces";
import { updateEmailVerificationTokenRepository } from "@/repositories/auth/register.repository";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";

const resendLinkService = async (
  fastify: FastifyInstance,
  resendLinkBody: AuthInterface.IResendLinkBody,
): Promise<
  AuthInterface.IResendLinkResponse | ErrorInterface.IGenericError
> => {
  try {
    const { email } = resendLinkBody;

    const user = await getUserByEmailRepository(email);

    if (!user) {
      return createErrorMessage("error.auth.userNotFound", 404);
    }

    if (user.isEmailVerified) {
      return createErrorMessage("error.auth.emailAlreadyVerified", 409);
    }

    const token = fastify.jwt.sign(
      { _id: user._id },
      { expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES },
    );

    const updatedUser = await updateEmailVerificationTokenRepository(
      user._id.toString(),
      token,
    );

    if (!updatedUser) {
      return createErrorMessage("error.auth.userNotFound", 404);
    }

    const verificationLink = `${siteOrigin}/verify-email?token=${token}`;

    await fastify.rabbitMQ.publishMessage(
      "send_verification_email_queue",
      JSON.stringify({
        userEmail: user.email,
        verificationLink,
      }),
    );

    return {
      message: fastify.i18n("message.auth.resendLinkSuccess"),
    };
  } catch (_error) {
    return createErrorMessage("error.auth.resendLinkError");
  }
};

export default resendLinkService;
