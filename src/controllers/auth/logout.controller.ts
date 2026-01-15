import { FastifyReply, FastifyRequest } from "fastify";

import cookiesOptions from "@/helpers/cookies-options";
import createErrorMessage from "@/helpers/create-error-message";
import errorHandler from "@/handlers/error.handler";
import logoutService from "@/services/auth/logout.service";

const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = await request.jwtVerify<{ _id: string }>();
    const userId = payload._id;
    const response = await logoutService(userId);

    if (typeof response !== "boolean") {
      return errorHandler(response, request, reply);
    }

    request.log.info(request.i18n.t("message.auth.userLogout", { userId }));

    return reply
      .clearCookie("accessToken", cookiesOptions.accessToken)
      .clearCookie("refreshToken", cookiesOptions.refreshToken)
      .status(200)
      .send({ message: request.i18n.t("message.auth.logoutSuccessful") });
  } catch (_error) {
    reply
      .clearCookie("accessToken", cookiesOptions.accessToken)
      .clearCookie("refreshToken", cookiesOptions.refreshToken);

    const errorMessage = createErrorMessage(
      "error.auth.invalidAccessToken",
      401,
    );

    request.log.error(errorMessage.message);

    return errorHandler(errorMessage, request, reply);
  }
};

export default logout;
