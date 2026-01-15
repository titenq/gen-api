import { FastifyRequest, FastifyReply } from "fastify";

import { HealthStatus } from "@/enums/health.enum";
import healthService from "@/services/health/health.service";

const healthController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const healthResponse = await healthService(request.server);
  const statusCode = healthResponse.status === HealthStatus.OK ? 200 : 503;

  if (statusCode === 503) {
    request.log.error("Health check failed");
  } else {
    request.log.info("Health check passed");
  }

  return reply.status(statusCode).send(healthResponse);
};

export default healthController;
