import { FastifyInstance } from "fastify";

import { IWSEvent } from "@/interfaces/ws.interface";

const testService = async (fastify: FastifyInstance, connection: any) => {
  const socket = connection.socket || connection;

  if (socket.readyState === 1) {
    socket.send(JSON.stringify({ event: "connection", message: "Connected" }));
  }

  fastify.consumeWS("test", (data: IWSEvent) => {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(data));
    }
  });

  socket.on("message", async (message: Buffer) => {
    const text = message.toString();

    await fastify.publishWS("test", { event: "test", message: text });
  });
};

export default testService;
