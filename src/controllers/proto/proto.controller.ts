import { FastifyReply, FastifyRequest } from "fastify";

import protoService from "@/services/proto/proto.service";
import getAppName from "@/helpers/get-app-name";

const protoController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  const buffer = await protoService();

  reply.header("Content-Type", "application/zip");
  reply.header(
    "Content-Disposition",
    `attachment; filename="${getAppName()}_proto.zip"`,
  );

  return reply.send(buffer);
};

export default protoController;
