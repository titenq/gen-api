import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import resetPasswordService from "@/services/auth/reset-password.service";
import { AuthInterface } from "@/interfaces";

const resetPassword = async (
  request: FastifyRequest<{ Body: AuthInterface.IResetPasswordBody }>,
  reply: FastifyReply,
) => {
  const { token, password } = request.body;

  const response = await resetPasswordService(request.server, {
    token,
    password,
  });

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  request.log.info(response.message);

  return reply.status(200).send(response);
};

export default resetPassword;
