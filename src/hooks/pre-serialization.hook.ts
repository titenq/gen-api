import { FastifyInstance } from "fastify";
import { ZodError } from "zod";

const preSerializationHook = (fastify: FastifyInstance) => {
  fastify.addHook("preSerialization", async (request, reply, payload) => {
    if (request.headers.accept?.includes("application/x-protobuf")) {
      return payload;
    }

    try {
      const schema = (request.routeOptions.schema as any)?.response?.[
        reply.statusCode
      ];

      if (schema && typeof schema.parse === "function") {
        schema.parse(payload);
      }

      return payload;
    } catch (error) {
      if (error instanceof ZodError) {
        const zodIssue = error.issues[0];

        if (zodIssue.message.startsWith("validation.")) {
          return reply.status(400).send({
            error: true,
            message: request.i18n.t(zodIssue.message),
            statusCode: 400,
          });
        }

        return reply.status(500).send({
          error: true,
          message: request.i18n.t("error.handler.responseSerializationError"),
          statusCode: 500,
        });
      }

      throw error;
    }
  });
};

export default preSerializationHook;
