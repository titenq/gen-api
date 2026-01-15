import { FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";

import testService from "@/services/ws/test.service";

const test = async (connection: WebSocket, req: FastifyRequest) => {
  await testService(req.server, connection);
};

export default test;
