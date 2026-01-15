import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import forgotPasswordService from "@/services/auth/forgot-password.service";
import { AuthInterface } from "@/interfaces";

const forgotPassword = async (
  request: FastifyRequest<{
    Body: AuthInterface.IForgotPasswordBody;
    Headers: AuthInterface.IForgotPasswordHeaders;
  }>,
  reply: FastifyReply,
) => {
  const { email } = request.body;

  const response = await forgotPasswordService(request.server, { email });

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  request.log.info(response?.message);

  return reply.status(200).send(response);
};

export default forgotPassword;
