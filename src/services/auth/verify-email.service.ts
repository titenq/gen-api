import { FastifyInstance } from "fastify";

import createErrorMessage from "@/helpers/create-error-message";
import {
  AuthInterface,
  ErrorInterface,
  JwtInterface,
  UserInterface,
} from "@/interfaces";
import {
  getUserByIdAndEmailTokenRepository,
  verifyUserEmailRepository,
} from "@/repositories/auth/verify-email.repository";

const verifyEmailService = async (
  fastify: FastifyInstance,
  verifyEmailData: AuthInterface.IVerifyEmailBody,
): Promise<
  UserInterface.IEmailVerifiedResponse | ErrorInterface.IGenericError
> => {
  try {
    const decoded = await fastify.jwt.verify<AuthInterface.IDecodedToken>(
      verifyEmailData.token,
    );

    const user = await getUserByIdAndEmailTokenRepository(
      decoded._id,
      verifyEmailData.token,
    );

    if (!user) {
      return createErrorMessage("error.auth.failedToVerifyEmail");
    }

    const userVerified = await verifyUserEmailRepository(user._id.toString());

    if (!userVerified) {
      return createErrorMessage("error.auth.failedToVerifyEmail");
    }

    const userVerifiedModified: UserInterface.IEmailVerifiedResponse = {
      _id: userVerified._id,
      name: userVerified.name,
      email: userVerified.email,
      roles: userVerified.roles,
      createdAt: userVerified.createdAt,
      updatedAt: userVerified.updatedAt,
    };

    return userVerifiedModified;
  } catch (error) {
    if ((error as JwtInterface.IJwtError).code === "FAST_JWT_EXPIRED") {
      return createErrorMessage("error.auth.accessTokenExpired", 401);
    }

    return createErrorMessage("error.auth.failedToVerifyEmail");
  }
};

export default verifyEmailService;
