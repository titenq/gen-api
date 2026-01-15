import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import verifyEmailService from "@/services/auth/verify-email.service";
import { AuthInterface } from "@/interfaces";

const verifyEmail = async (
  request: FastifyRequest<{ Body: AuthInterface.IVerifyEmailBody }>,
  reply: FastifyReply,
) => {
  const { token } = request.body;

  const response = await verifyEmailService(request.server, { token });

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  request.log.info(`Email ${response.email} verified successfully`);

  return reply.status(200).send(response);
};

export default verifyEmail;
