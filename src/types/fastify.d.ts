import "fastify";
import Redis from "ioredis";
import { Type } from "protobufjs";
import * as amqp from "amqplib";

declare module "fastify" {
  interface FastifyInstance {
    cache<T>(
      key: string,
      ttl: number,
      fetcher: () => Promise<T>,
      request?: FastifyRequest,
    ): Promise<T>;
    redis: Redis | null;
    protobuf: {
      types: Record<string, Type>;
      getType(name: string): Type | undefined;
    };
    rabbitMQ: {
      connection: amqp.ChannelModel;
      channel: amqp.Channel;
      publishMessage: (queue: string, message: string) => Promise<boolean>;
      consumeMessages: (
        queue: string,
        callback: (msgContent: string) => void,
      ) => Promise<void>;
    };
    publishWS: (route: string, payload: IWSEvent) => Promise<void>;
    consumeWS: (
      route: string,
      callback: (data: IWSEvent) => void,
    ) => Promise<void>;
  }

  interface FastifyContextConfig {
    protobufType?: string;
  }

  interface FastifyReply {
    protobufType?: string;
  }

  interface FastifyRequest {
    startEpoch?: number;
  }
}
