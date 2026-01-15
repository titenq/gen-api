import { FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";

import registerService from "@/services/ws/register.service";

const register = async (connection: WebSocket, req: FastifyRequest) => {
  await registerService(req.server, connection, req);
};

export default register;
