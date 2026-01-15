import { FastifyInstance } from "fastify";

import { EMAIL_VERIFICATION_TOKEN_EXPIRES } from "@/constants/constants";
import createErrorMessage from "@/helpers/create-error-message";
import siteOrigin from "@/helpers/site-origin";
import { ErrorInterface, UserInterface } from "@/interfaces";
import {
  createUserRepository,
  updateEmailVerificationTokenRepository,
} from "@/repositories/auth/register.repository";

const registerService = async (
  fastify: FastifyInstance,
  userData: UserInterface.IUserBody,
): Promise<
  UserInterface.IUserResponseModified | ErrorInterface.IGenericError
> => {
  try {
    userData.name = userData.name.trim();

    const user = await createUserRepository(userData);

    const emailVerificationToken = fastify.jwt.sign(
      { _id: user._id },
      { expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES },
    );

    const updatedUser = await updateEmailVerificationTokenRepository(
      user._id.toString(),
      emailVerificationToken,
    );

    if (!updatedUser) {
      return createErrorMessage("error.auth.userNotFound", 404);
    }

    const verificationLink = `${siteOrigin}/verify-email?token=${emailVerificationToken}`;

    await fastify.rabbitMQ.publishMessage(
      "send_verification_email_queue",
      JSON.stringify({
        userEmail: user.email,
        verificationLink,
      }),
    );

    await fastify.publishWS("register", {
      event: "register",
      message: fastify.i18n.t("message.auth.newUserRegistered", {
        email: user.email,
      }),
    });

    return updatedUser;
  } catch (error) {
    const mongoError = error as ErrorInterface.IMongoDuplicateKeyError;

    if (mongoError.code === 11000 && mongoError.keyPattern?.email) {
      return createErrorMessage("error.auth.emailAlreadyExists", 409);
    }

    if (mongoError.code === 11000 && mongoError.keyPattern?.normalizedName) {
      return createErrorMessage("error.auth.nameAlreadyExists", 409);
    }

    return createErrorMessage("error.auth.createUserError");
  }
};

export default registerService;
