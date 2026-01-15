import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { Roles } from "@/enums/user.enum";
import verifyRoles from "@/handlers/verify-roles.handler";
import verifyToken from "@/handlers/verify-token.handler";
import { UserInterface } from "@/interfaces";
import * as userController from "@/controllers/user";
import * as userSchema from "@/schemas/user";

const userRoute = async (fastify: FastifyInstance) => {
  const routeOptions = fastify.withTypeProvider<ZodTypeProvider>();

  routeOptions.get<{
    Params: UserInterface.IGetUserByIdParams;
  }>(
    "/users/:id",
    {
      schema: userSchema.getUserByIdSchema,
      preHandler: [verifyToken],
      config: {
        protobufType: "user.GetUserByIdResponse",
      },
    },
    userController.getUserById,
  );

  routeOptions.get<{
    Querystring: UserInterface.IGetUsersQuery;
  }>(
    "/users",
    {
      schema: userSchema.getUsersSchema,
      preHandler: [verifyRoles([Roles.ADMIN])],
    },
    userController.getUsers,
  );
};

export default userRoute;
