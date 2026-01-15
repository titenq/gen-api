import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

import {
  RATE_LIMIT_BAN,
  RATE_LIMIT_MAX,
  RATE_LIMIT_TIME_WINDOW,
} from "@/constants/constants";

const configRateLimit = async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    global: true,
    hook: "preHandler",
    max: RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_TIME_WINDOW,
    ban: RATE_LIMIT_BAN,
    allowList: ["127.0.0.1"],
    errorResponseBuilder: function (request, context) {
      const message = context.ban ? "error.ipBan" : "error.rateLimitExceeded";

      return {
        error: true,
        statusCode: 429,
        message,
      };
    },
  });
};

export default configRateLimit;
