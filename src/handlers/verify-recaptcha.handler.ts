import { FastifyRequest, FastifyReply } from "fastify";

import env from "@/config/env";
import errorHandler from "@/handlers/error.handler";
import createErrorMessage from "@/helpers/create-error-message";
import { RECAPTCHA_SECRET_KEY_TEST } from "@/constants/constants";

const verifyRecaptcha = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { NODE_ENV, RECAPTCHA_SECRET_KEY } = env;

  const recaptchaSecretKey =
    NODE_ENV === "development"
      ? RECAPTCHA_SECRET_KEY_TEST
      : RECAPTCHA_SECRET_KEY;

  const recaptchaToken = request.headers["x-recaptcha-token"];

  if (!recaptchaToken || recaptchaToken === "") {
    const errorMessage = createErrorMessage(
      "error.handler.recaptchaNotProvided",
      403,
    );

    return errorHandler(errorMessage, request, reply);
  }

  const captchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`,
    {
      method: "POST",
    },
  );

  if (!captchaResponse.ok) {
    const errorMessage = createErrorMessage(
      "error.handler.recaptchaInvalid",
      403,
    );

    return errorHandler(errorMessage, request, reply);
  }

  return recaptchaToken;
};

export default verifyRecaptcha;
