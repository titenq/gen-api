import { FastifyReply, FastifyRequest } from "fastify";

import errorHandler from "@/handlers/error.handler";
import registerService from "@/services/auth/register.service";
import { AuthInterface } from "@/interfaces";

const register = async (
  request: FastifyRequest<{
    Body: AuthInterface.IRegisterBody;
    Headers: AuthInterface.IRegisterHeaders;
  }>,
  reply: FastifyReply,
) => {
  const response = await registerService(request.server, request.body);

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  request.log.info(
    request.i18n.t("message.auth.newUserRegistered", { email: response.email }),
  );

  return reply.status(201).send(response);
};

export default register;
