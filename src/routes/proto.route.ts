import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import protoController from "@/controllers/proto/proto.controller";
import { protoSchema } from "@/schemas/proto/proto.schema";

const protoRoute = async (fastify: FastifyInstance) => {
  const routeOptions = fastify.withTypeProvider<ZodTypeProvider>();

  routeOptions.get(
    "/proto",
    {
      schema: protoSchema,
      config: {
        rateLimit: false,
      },
      compress: false,
    },
    protoController,
  );
};

export default protoRoute;
