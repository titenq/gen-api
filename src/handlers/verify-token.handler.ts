import { FastifyReply, FastifyRequest } from "fastify";

import errorHandler from "@/handlers/error.handler";
import createErrorMessage from "@/helpers/create-error-message";
import { JwtInterface } from "@/interfaces";

const verifyToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean | void> => {
  const accessToken = request.cookies.accessToken;

  if (!accessToken) {
    const errorMessage = createErrorMessage(
      "error.handler.tokenNotProvided",
      401,
    );

    return errorHandler(errorMessage, request, reply);
  }

  try {
    const decodedToken =
      request.server.jwt.verify<JwtInterface.IJwtPayload>(accessToken);

    request.user = decodedToken;

    return true;
  } catch (error: unknown) {
    reply.clearCookie("accessToken");

    const err = error as Error;
    let errorMessage;

    if (err.message.includes("expired")) {
      errorMessage = createErrorMessage("error.auth.accessTokenExpired", 401);
    } else if (err.message.includes("malformed")) {
      errorMessage = createErrorMessage("error.auth.invalidTokenFormat", 401);
    } else if (err.message.includes("signature")) {
      errorMessage = createErrorMessage("error.auth.invalidSignature", 401);
    } else if (err.message.includes("invalid")) {
      errorMessage = createErrorMessage("error.auth.invalidToken", 401);
    } else {
      errorMessage = createErrorMessage(
        "error.auth.internalErrorAuthentication",
        500,
      );
    }

    return errorHandler(errorMessage, request, reply);
  }
};

export default verifyToken;
