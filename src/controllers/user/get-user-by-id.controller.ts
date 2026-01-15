import { FastifyReply, FastifyRequest } from "fastify";

import { UserInterface, ErrorInterface } from "@/interfaces";
import errorHandler from "@/handlers/error.handler";
import getUserByIdService from "@/services/user/get-user-by-id.service";
import createErrorMessage from "@/helpers/create-error-message";
import { CACHE_TTL } from "@/constants/constants";

const getUserById = async (
  request: FastifyRequest<{ Params: UserInterface.IGetUserByIdParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const user = await request.server.cache<
      UserInterface.IGetUserByIdResponse | ErrorInterface.IGenericError
    >(
      `user:${id}`,
      CACHE_TTL,
      async () => {
        return await getUserByIdService(id);
      },
      request,
    );

    if ("error" in user) {
      reply.protobufType = "error.GenericError";

      request.log.error(user.message);

      return errorHandler(user, request, reply);
    }

    reply.protobufType = "user.GetUserByIdResponse";

    request.log.info(`User ${id} retrieved successfully`);

    return reply.status(200).send(user);
  } catch (_error) {
    const errorMessage = createErrorMessage("validation.getUserById", 500);

    reply.protobufType = "error.GenericError";

    request.log.error(errorMessage.message);

    return errorHandler(errorMessage, request, reply);
  }
};

export default getUserById;
