import { FastifyReply, FastifyRequest } from "fastify";

import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/constants/constants";
import errorHandler from "@/handlers/error.handler";
import cookiesOptions from "@/helpers/cookies-options";
import { AuthInterface } from "@/interfaces";
import loginService from "@/services/auth/login.service";

const login = async (
  request: FastifyRequest<{
    Body: AuthInterface.ILoginBody;
    Headers: AuthInterface.ILoginHeaders;
  }>,
  reply: FastifyReply,
) => {
  const response = await loginService(request.body);

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  const accessToken = await reply.jwtSign(
    { _id: response._id, roles: response.roles },
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  );

  const refreshToken = await reply.jwtSign(
    { _id: response._id },
    { expiresIn: REFRESH_TOKEN_EXPIRES },
  );

  request.log.info(`User ${response._id} logged in successfully`);

  return reply
    .setCookie("accessToken", accessToken, cookiesOptions.accessToken)
    .setCookie("refreshToken", refreshToken, cookiesOptions.refreshToken)
    .status(200)
    .send(response);
};

export default login;
