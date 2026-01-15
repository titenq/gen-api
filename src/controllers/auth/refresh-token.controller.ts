import { FastifyReply, FastifyRequest } from "fastify";

import errorHandler from "@/handlers/error.handler";
import cookiesOptions from "@/helpers/cookies-options";
import createErrorMessage from "@/helpers/create-error-message";
import refreshTokenService from "@/services/auth/refresh-token.service";

const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    const errorMessage = createErrorMessage(
      "error.auth.refreshTokenNotProvided",
      401,
    );

    request.log.error(errorMessage.message);

    return errorHandler(errorMessage, request, reply);
  }

  const result = await refreshTokenService(request.server, refreshToken);

  if ("error" in result) {
    reply
      .clearCookie("accessToken", cookiesOptions.accessToken)
      .clearCookie("refreshToken", cookiesOptions.refreshToken);

    request.log.error(result.message);

    return errorHandler(result, request, reply);
  }

  const response = {
    message: request.i18n.t("message.auth.tokensUpdatedSuccess"),
  };

  request.log.info(response.message);

  return reply
    .setCookie("accessToken", result.newAccessToken, cookiesOptions.accessToken)
    .setCookie(
      "refreshToken",
      result.newRefreshToken,
      cookiesOptions.refreshToken,
    )
    .status(200)
    .send(response);
};

export default refreshToken;
