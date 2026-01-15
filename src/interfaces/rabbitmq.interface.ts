import * as amqp from "amqplib";

export interface IRabbitMQ {
  connection: amqp.ChannelModel;
  channel: amqp.Channel;
  publishMessage: (queue: string, message: string) => Promise<boolean>;
  consumeMessages: (
    queue: string,
    callback: (msgContent: string) => void,
  ) => Promise<void>;
}
