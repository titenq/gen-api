import { FastifyInstance, FastifyRequest } from "fastify";

import { IWSEvent } from "@/interfaces/ws.interface";
import verifyWSRoles from "@/helpers/verify-ws-roles";

const registerService = async (
  fastify: FastifyInstance,
  connection: any,
  req: FastifyRequest,
) => {
  const socket = connection.socket || connection;

  if (!verifyWSRoles(["ADMIN"])(req, socket)) {
    return;
  }

  fastify.consumeWS("register", (data: IWSEvent) => {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(data));
    }
  });

  socket.on("message", async (message: Buffer) => {
    const text = message.toString();

    await fastify.publishWS("register", { event: "register", message: text });
  });
};

export default registerService;
