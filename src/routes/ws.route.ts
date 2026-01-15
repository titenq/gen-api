import { FastifyInstance } from "fastify";

import wsController from "@/controllers/ws";

const wsRoute = async (fastify: FastifyInstance) => {
  fastify.get("/ws/test", { websocket: true }, wsController.test);

  fastify.get("/ws/register", { websocket: true }, wsController.register);
};

export default wsRoute;
