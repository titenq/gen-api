import argon2 from "argon2";

import env from "@/config/env";
import createErrorMessage from "@/helpers/create-error-message";
import { AuthInterface, ErrorInterface, UserInterface } from "@/interfaces";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";

const { ARGON2_PEPPER } = env;

const loginService = async (
  loginData: AuthInterface.ILoginBody,
): Promise<UserInterface.IUserResponse | ErrorInterface.IGenericError> => {
  try {
    const { email, password } = loginData;

    const response = await getUserByEmailRepository(email);

    if (!response) {
      return createErrorMessage("error.auth.invalidCredentials", 401);
    }

    if (!response.isEmailVerified) {
      return createErrorMessage("error.auth.emailNotVerified", 403);
    }

    const isPasswordValid = await argon2.verify(response.password, password, {
      secret: Buffer.from(ARGON2_PEPPER, "base64"),
    });

    if (!isPasswordValid) {
      return createErrorMessage("error.auth.invalidCredentials", 401);
    }

    return response;
  } catch (error) {
    const err = error as Error;
    let errorMessage: ErrorInterface.IGenericError;

    if (err.message.includes("expired")) {
      errorMessage = createErrorMessage("error.auth.accessTokenExpired", 401);
    } else if (err.message.includes("signature")) {
      errorMessage = createErrorMessage("error.auth.invalidSignature", 401);
    } else if (
      err.message.includes("malformed") ||
      err.message.includes("invalid")
    ) {
      errorMessage = createErrorMessage("error.auth.invalidTokenFormat", 401);
    } else {
      errorMessage = createErrorMessage(
        "error.auth.internalErrorAuthentication",
        500,
      );
    }

    return errorMessage;
  }
};

export default loginService;
