import {
  MongoDBStatus,
  HealthStatus,
  RabbitMQStatus,
  RedisStatus,
} from "@/enums/health.enum";

export interface IHealthMongoDB {
  status: MongoDBStatus;
  latency?: number;
  error?: string;
}

export interface IHealthRedis {
  status: RedisStatus;
  latency?: number;
  error?: string;
}

export interface IHealthRabbitMQ {
  status: RabbitMQStatus;
  latency?: number;
  error?: string;
}

export interface IHealthResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime?: string;
  uptimeSeconds?: number;
  dependencies: {
    mongoDB: IHealthMongoDB;
    redis: IHealthRedis;
    rabbitMQ: IHealthRabbitMQ;
  };
}
