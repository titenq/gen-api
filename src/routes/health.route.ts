import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import healthController from "@/controllers/health/health.controller";
import { healthSchema } from "@/schemas/health/health.schema";

const healthRoute = async (fastify: FastifyInstance) => {
  const routeOptions = fastify.withTypeProvider<ZodTypeProvider>();

  routeOptions.get(
    "/health",
    {
      schema: healthSchema,
      config: {
        rateLimit: false,
      },
      compress: false,
    },
    healthController,
  );
};

export default healthRoute;
