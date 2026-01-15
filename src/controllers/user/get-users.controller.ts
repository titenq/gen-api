import { FastifyRequest, FastifyReply } from "fastify";

import getUsersService from "@/services/user/get-users.service";
import errorHandler from "@/handlers/error.handler";
import * as UserInterface from "@/interfaces/user.interface";

const getUsers = async (
  request: FastifyRequest<{
    Querystring: UserInterface.IGetUsersQuery;
  }>,
  reply: FastifyReply,
) => {
  const users = await getUsersService(request.query);

  if ("error" in users) {
    request.log.error(users.message);

    return errorHandler(users, request, reply);
  }

  request.log.info("Users retrieved successfully");

  return reply.status(200).send(users);
};

export default getUsers;
