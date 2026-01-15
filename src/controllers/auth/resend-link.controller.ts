import { FastifyRequest, FastifyReply } from "fastify";

import errorHandler from "@/handlers/error.handler";
import resendLinkService from "@/services/auth/resend-link.service";
import { AuthInterface } from "@/interfaces";

const resendLink = async (
  request: FastifyRequest<{ Body: AuthInterface.IResendLinkBody }>,
  reply: FastifyReply,
) => {
  const { email } = request.body;

  const response = await resendLinkService(request.server, { email });

  if ("error" in response) {
    request.log.error(response?.message);

    return errorHandler(response, request, reply);
  }

  request.log.info(response.message);

  return reply.status(200).send(response);
};

export default resendLink;
