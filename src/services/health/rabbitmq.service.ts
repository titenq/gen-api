import { FastifyInstance } from "fastify";

import { RabbitMQStatus } from "@/enums/health.enum";
import { HealthInterface } from "@/interfaces";

const rabbitMQService = async (
  fastify: FastifyInstance,
): Promise<HealthInterface.IHealthRabbitMQ> => {
  if (!fastify.rabbitMQ) {
    return {
      status: RabbitMQStatus.DOWN,
      error: "RabbitMQ not configured",
    };
  }

  try {
    const connection = fastify.rabbitMQ.connection;

    if (!connection) {
      return {
        status: RabbitMQStatus.DOWN,
        error: "RabbitMQ connection is closed",
      };
    }

    const start = Date.now();
    const channel = await connection.createChannel();

    const tempQueue = await channel.assertQueue("", {
      exclusive: true,
      autoDelete: true,
    });

    await channel.deleteQueue(tempQueue.queue);

    await channel.close();
    const latency = Date.now() - start;

    return {
      status: RabbitMQStatus.OK,
      latency,
    };
  } catch (_error) {
    return {
      status: RabbitMQStatus.DOWN,
      error: "RabbitMQ connection failed",
    };
  }
};

export default rabbitMQService;
