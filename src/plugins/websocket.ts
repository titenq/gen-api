import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import * as amqp from "amqplib";

import env from "@/config/env";
import { IWSEvent } from "@/interfaces/ws.interface";

const { RABBITMQ_USER, RABBITMQ_PASSWORD } = env;
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672`;
const EXCHANGE = "ws_exchange";

const websocketPlugin = fp(async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

  fastify.decorate(
    "consumeWS",
    async (route: string, callback: (data: IWSEvent) => void) => {
      const tempQueue = await channel.assertQueue("", { exclusive: true });
      const exchangeName = `ws_${route}_exchange`;

      await channel.assertExchange(exchangeName, "fanout", { durable: false });
      await channel.bindQueue(tempQueue.queue, exchangeName, "");

      channel.consume(
        tempQueue.queue,
        (msg) => {
          if (msg) callback(JSON.parse(msg.content.toString()) as IWSEvent);
        },
        { noAck: true },
      );
    },
  );

  fastify.decorate("publishWS", async (route: string, payload: IWSEvent) => {
    const exchangeName = `ws_${route}_exchange`;

    await channel.assertExchange(exchangeName, "fanout", { durable: false });

    channel.publish(exchangeName, "", Buffer.from(JSON.stringify(payload)));
  });
});

export default websocketPlugin;
