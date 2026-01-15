import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { ErrorInterface } from "@/interfaces";

const errorHandler = (
  error: ZodError | ErrorInterface.IGenericError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (reply.sent) {
    return;
  }

  const acceptsProtobuf = request.headers.accept?.includes(
    "application/x-protobuf",
  );

  if ("validation" in error && Array.isArray(error.validation)) {
    const statusCode = 400;
    const message = error.validation
      .map((issue: { message: string }) => {
        if (issue.message.startsWith("validation.")) {
          return request.i18n.t(issue.message);
        }

        return issue.message;
      })
      .join(" | ");

    const errorResponse = {
      error: true,
      message,
      statusCode,
    };

    if (acceptsProtobuf) {
      reply.protobufType = "error.GenericError";
    }

    return reply.status(statusCode).send(errorResponse);
  }

  if ("statusCode" in error) {
    error.message = request.i18n.t(error.message);

    if (acceptsProtobuf) {
      reply.protobufType = "error.GenericError";
    }

    return reply.status(error.statusCode).send(error);
  }

  const fallbackError = {
    error: true,
    message: request.i18n.t("error.handler.internalServerError"),
    statusCode: 500,
  };

  if (acceptsProtobuf) {
    reply.protobufType = "error.GenericError";
  }

  return reply.status(500).send(fallbackError);
};

export default errorHandler;
