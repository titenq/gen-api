import fp from "fastify-plugin";
import * as amqp from "amqplib";

import env from "@/config/env";
import forgotPasswordConsumer from "@/consumers/forgot-password.consumer";
import verificationEmailConsumer from "@/consumers/verification-email.consumer";
import translate from "@/helpers/translate";
import { RabbitMQInterface } from "@/interfaces";

const { RABBITMQ_USER, RABBITMQ_PASSWORD } = env;
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672`;

const connectWithRetry = async (
  retries = 10,
  delayMs = 2000,
  initialDelay = 2000,
): Promise<amqp.ChannelModel> => {
  if (initialDelay > 0) {
    await new Promise((res) => setTimeout(res, initialDelay));
  }

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);

      return conn;
    } catch (_error) {
      console.warn(translate("message.rabbitmq.connectionFailed"));

      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  throw new Error(translate("message.rabbitmq.connectionFailedDetailed"));
};

export interface RabbitMQPluginOptions {
  retries?: number;
  delayMs?: number;
  initialDelay?: number;
}

const rabbitMQPlugin = fp<RabbitMQPluginOptions>(async (fastify, opts) => {
  let connection: amqp.ChannelModel;
  let channel: amqp.Channel;

  try {
    connection = await connectWithRetry(
      opts.retries,
      opts.delayMs,
      opts.initialDelay,
    );
    channel = await connection.createChannel();

    connection.on("error", (err) =>
      console.error(translate("message.rabbitmq.connectionError"), err),
    );
    connection.on("close", () =>
      console.log(translate("message.rabbitmq.connectionClosed")),
    );

    console.log(translate("message.rabbitmq.connectionSuccess"));

    const publishMessage = async (
      queue: string,
      message: string,
    ): Promise<boolean> => {
      await channel.assertQueue(queue, { durable: true });

      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

      console.log(
        translate("message.rabbitmq.messagePublished", { queue, message }),
      );

      return true;
    };

    const consumeMessages = async (
      queue: string,
      callback: (msgContent: string) => void,
    ): Promise<void> => {
      await channel.assertQueue(queue, { durable: true });

      await channel.consume(queue, (msg) => {
        if (msg) {
          const content = msg.content.toString();

          callback(content);
          channel.ack(msg);
        }
      });

      console.log(translate("message.rabbitmq.consumerStarted", { queue }));
    };

    fastify.decorate<RabbitMQInterface.IRabbitMQ>("rabbitMQ", {
      connection,
      channel,
      publishMessage,
      consumeMessages,
    });

    await forgotPasswordConsumer(consumeMessages);
    await verificationEmailConsumer(consumeMessages);
  } catch (error) {
    console.error(translate("message.rabbitmq.errorConnecting"), error);

    throw error;
  }
});

export default rabbitMQPlugin;
